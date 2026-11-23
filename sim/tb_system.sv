`timescale 1ns/1ps
module tb_system;
    reg clk=0;always #5 clk=~clk;
    reg rst=1,tick=1,mode=0,button=0;
    reg [3:0] arrivals_a=0,arrivals_b=0;
    wire [7:0] qa,qb;wire da,db,oa,ob;
    wire [3:0] state;wire [15:0] elapsed,remaining;
    wire active,pending,walk;wire [2:0] la,lb;
    wire [1:0] level_a,level_b;
    demand_level dla(qa,level_a), dlb(qb,level_b);
    traffic_controller dut(clk,rst,tick,mode,button,qa,qb,state,elapsed,active,pending,la,lb,walk,remaining);
    queue_model ma(clk,rst,tick,la[0],arrivals_a,qa,da,oa);
    queue_model mb(clk,rst,tick,lb[0],arrivals_b,qb,db,ob);
    // Separate queue instance for edge cases (saturation, empty, simultaneous events).
    reg qr=1,qgreen=0;reg [3:0] arrival_test=0;
    wire [7:0] qtest;wire dep_test,over_test;
    queue_model mq(clk,qr,tick,qgreen,arrival_test,qtest,dep_test,over_test);
    reg trst=1;wire time_tick;
    second_tick #(4) divider(clk,trst,time_tick);
    integer checks=0,random_steps=0,fd,metrics,n,trial;
    integer depart_a,depart_b;
    integer ref_qa=0,ref_qb=0;
    bit credit_a=0,credit_b=0,ref_over_a=0,ref_over_b=0;
    integer area,peak,total_a,total_b,total_in_a,total_in_b,wait_a,wait_b;
    integer maxwait_a,maxwait_b,walk_count,oldstate,seed=32'h12345678;
    integer durations[0:8];integer seen[0:8];
    task check(input bit cond,input string msg);
        begin checks=checks+1;if(!cond)$fatal(1,"FAIL %s state=%0d",msg,state);end
    endtask
    // Each car needs two eligible ticks. An interrupted first tick is lost.
    // Compute departures from the reference queue and credit, never from da/db.
    task advance_queue(input bit green,input integer arrivals,
                       inout integer queued,inout bit credit,inout bit over,
                       output bit departure);
        integer next_queue;
        begin
            departure=0;
            if(rst)begin queued=0;credit=0;over=0;end
            else if(tick)begin
                if(green && queued>0)begin
                    departure=credit;
                    credit=!credit;
                end else credit=0;
                next_queue=queued-departure+arrivals;
                over=(next_queue>255);
                queued=over ? 255 : next_queue;
            end
        end
    endtask
    task step;
        integer prior_state,prior_elapsed,prior_mode;
        bit expected_depart_a,expected_depart_b;
        begin
            // Sample settled, pre-edge lamps and departures after changing inputs.
            #1;
            depart_a=da;depart_b=db;
            prior_state=state;prior_elapsed=elapsed;prior_mode=active;
            advance_queue(la[0],arrivals_a,ref_qa,credit_a,ref_over_a,expected_depart_a);
            advance_queue(lb[0],arrivals_b,ref_qb,credit_b,ref_over_b,expected_depart_b);
            check(da===expected_depart_a && db===expected_depart_b,"Vehicle departure schedule");
            @(posedge clk);#1;
            check(qa===ref_qa && qb===ref_qb,"Queue update matches independent model");
            check(oa===ref_over_a && ob===ref_over_b,"Overflow matches independent model");
            check(!(la[0]&&lb[0]),"No simultaneous green");
            check(!walk || (la==4 && lb==4),"Pedestrian safety");
            check(la==1 || la==2 || la==4,"A one-hot lamps");
            check(lb==1 || lb==2 || lb==4,"B one-hot lamps");
            seen[state]=seen[state]+1;
            if(!rst)begin
                check(!oa && !ob,"Scenario queues do not saturate");
                check(active==prior_mode,"Mode stable outside reset");
                if(state==prior_state) check(elapsed==prior_elapsed+1,"Elapsed progression");
                else begin
                    check(elapsed==0,"Timer restarts at phase boundary");
                    case(prior_state)
                        0: check(state==1 && prior_elapsed==0,"Boot duration and exit");
                        1,4: begin
                            check(state==prior_state+1,"Green exits only to yellow");
                            if(prior_mode)check(prior_elapsed+1>=6 && prior_elapsed+1<=20,"Adaptive duration bounds");
                            else check(prior_elapsed+1==12,"Fixed duration");
                        end
                        2,5: check(state==prior_state+1 && prior_elapsed+1==3,"Yellow duration and exit");
                        3: check((state==4 || state==7) && prior_elapsed==0,"Safe transition after A");
                        6: check((state==1 || state==7) && prior_elapsed==0,"Safe transition after B");
                        7: check(state==8 && prior_elapsed+1==6,"Walk duration and clearance");
                        8: check((state==1 || state==4) && prior_elapsed==0,"Clearance duration and exit");
                    endcase
                end
            end
            @(negedge clk);
        end
    endtask
    task scenario(input integer kind,input integer adaptive);
        integer t,arrA,arrB,previous;
        begin
            mode=adaptive;rst=1;button=0;arrivals_a=0;arrivals_b=0;step;rst=0;
            area=0;peak=0;total_a=0;total_b=0;total_in_a=0;total_in_b=0;
            wait_a=0;wait_b=0;maxwait_a=0;maxwait_b=0;walk_count=0;
            for(t=0;t<600;t=t+1)begin
                case(kind)
                    0:begin arrA=(t%5==0);arrB=(t%5==2);end
                    1:begin arrA=(t%3==0);arrB=(t%10==0);end
                    2:begin arrA=(t%10==0);arrB=(t%3==0);end
                    3:begin arrA=(t<200 && t%2==0);arrB=(t>=200 && t<400 && t%2==0);end
                endcase
                arrivals_a=arrA;arrivals_b=arrB;button=(t==35 || t==170 || t==310);
                previous=state;step;
                total_in_a=total_in_a+arrA;total_in_b=total_in_b+arrB;
                total_a=total_a+depart_a;total_b=total_b+depart_b;
                area=area+qa+qb;if(qa+qb>peak)peak=qa+qb;
                wait_a=(qa>0 && !la[0]) ? wait_a+1 : 0;
                wait_b=(qb>0 && !lb[0]) ? wait_b+1 : 0;
                if(wait_a>maxwait_a)maxwait_a=wait_a;
                if(wait_b>maxwait_b)maxwait_b=wait_b;
                if(walk && previous!=7)walk_count=walk_count+1;
                $fdisplay(fd,"%0d,%0d,%0d,%0d,%0d,%0d,%0d,%0d,%0d,%0d,%0d,%0d,%0d",kind,adaptive,t,state,qa,qb,la,lb,walk,pending,remaining,arrA,arrB);
            end
            check(total_in_a-total_a==qa && total_in_b-total_b==qb,"End-to-end car conservation");
            check(walk_count==3,"All three pedestrian requests served");
            check(maxwait_a<=40 && maxwait_b<=40,"Bounded time waiting for green in these scenarios");
            $fdisplay(metrics,"%0d,%0d,600,%0d,%0d,%0d,%0d,%0d,%0d,%0d,%0d",kind,adaptive,total_in_a+total_in_b,total_a+total_b,qa+qb,area,peak,maxwait_a,maxwait_b,walk_count);
            $display("PASS scenario=%0d mode=%0d served=%0d queue_area=%0d final_queue=%0d",kind,adaptive,total_a+total_b,area,qa+qb);
        end
    endtask
    initial begin
        for(n=0;n<=8;n=n+1)seen[n]=0;
        $dumpfile("build/demo.vcd");$dumpvars(0,tb_system);
        fd=$fopen("build/trace.csv","w");metrics=$fopen("build/metrics.csv","w");
        if(!fd || !metrics)$fatal(1,"Cannot open output files");
        $fdisplay(fd,"scenario,adaptive,second,state,queue_a,queue_b,lights_a,lights_b,walk,pending,remaining,arrivals_a,arrivals_b");
        $fdisplay(metrics,"scenario,adaptive,seconds,arrived,served,final_queue,queue_area_car_seconds,peak_total_queue,max_red_wait_a,max_red_wait_b,walk_visits");
        // Divider produces one tick every 4 clocks, including repeat intervals.
        step;trst=0;
        for(n=0;n<12;n=n+1)begin
            check(time_tick==(n%4==3),"Clock divider period");step;
        end
        // Queue model edge cases independent of controller.
        qr=0;qgreen=1;arrival_test=0;repeat(3)step;check(qtest==0,"Empty queue never underflows");
        qgreen=0;arrival_test=15;repeat(18)step;check(qtest==255 && over_test,"Queue saturates with overflow flag");
        arrival_test=0;qr=1;step;qr=0;
        arrival_test=2;qgreen=0;step;arrival_test=0;qgreen=1;step;
        check(qtest==2,"No departure until two green seconds");
        arrival_test=3;step;check(qtest==4,"Concurrent arrival and departure");
        // Start service, interrupt it with red, and require two new green ticks.
        arrival_test=0;step;check(qtest==4,"First green tick earns credit");
        qgreen=0;step;check(qtest==4,"Red interrupts service");
        qgreen=1;step;check(qtest==4,"First green after red cannot use old credit");
        step;check(qtest==3,"Second green after red serves one vehicle");
        qr=1;arrival_test=0;step;
        for(trial=0;trial<4;trial=trial+1)begin scenario(trial,0);scenario(trial,1);end
        rst=1;mode=1;step;rst=0;
        // Reproducible random arrivals/button and occasional resets. LCG seed is fixed.
        for(n=0;n<3000;n=n+1)begin
            seed=seed*1664525+1013904223;
            arrivals_a=(seed[3:0]==0);arrivals_b=(seed[7:4]==0);
            button=(seed[13:8]==0);rst=(n%497==496);mode=seed[16];
            step;random_steps=random_steps+1;
        end
        for(n=0;n<=8;n=n+1)check(seen[n]>0,"All FSM states covered");
        $fclose(fd);$fclose(metrics);
        $display("PASS tb_system checks=%0d randomized_seconds=%0d seed=0x12345678",checks,random_steps);
        $finish;
    end
    initial begin #2000000;$fatal(1,"System test timeout");end

    // Independent output check at every clock, including clocks with tick=0.
    integer expected_remaining, remaining_checks=0;
    always @(posedge clk) begin
        #2;
        case(state)
            1,4: expected_remaining=active ? 20 : 12;
            2,5: expected_remaining=3;
            7: expected_remaining=6;
            default: expected_remaining=1;
        endcase
        expected_remaining=(elapsed<expected_remaining) ? expected_remaining-elapsed : 0;
        remaining_checks=remaining_checks+1;
        if(remaining !== expected_remaining)
            $fatal(1,"FAIL remaining state=%0d elapsed=%0d got=%0d expected=%0d",
                   state,elapsed,remaining,expected_remaining);
    end
endmodule
