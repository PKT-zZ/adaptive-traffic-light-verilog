`timescale 1ns/1ps
module tb_controller;
    reg clk=0; always #5 clk=~clk;
    reg rst=1,tick=1,mode_select=0,ped_button=0;
    reg [7:0] queue_a=0,queue_b=0;
    wire [3:0] state; wire [15:0] elapsed,remaining;
    wire mode_active,ped_pending,walk; wire [2:0] lights_a,lights_b;
    traffic_controller dut(clk,rst,tick,mode_select,ped_button,queue_a,queue_b,
        state,elapsed,mode_active,ped_pending,lights_a,lights_b,walk,remaining);
    integer checks=0,i,j; reg [3:0] old_state;
    task check(input bit condition,input string message);
        begin checks=checks+1; if(!condition) $fatal(1,"FAIL: %s state=%0d elapsed=%0d",message,state,elapsed); end
    endtask
    task step;
        reg [2:0] expected_a,expected_b;
        begin @(posedge clk); #1;
            check(state<=8,"Legal state");
            // Truth table from the FSM specification, including the opposite red lamp.
            case(state)
                1: begin expected_a=1; expected_b=4; end
                2: begin expected_a=2; expected_b=4; end
                4: begin expected_a=4; expected_b=1; end
                5: begin expected_a=4; expected_b=2; end
                default: begin expected_a=4; expected_b=4; end
            endcase
            check(lights_a===expected_a,"A lamp matches FSM table");
            check(lights_b===expected_b,"B lamp matches FSM table");
            check(!(lights_a[0] && lights_b[0]),"No conflicting green");
            check(walk===(state==7),"WALK output matches FSM table");
            @(negedge clk);
        end
    endtask
    task reset_to(input bit adaptive);
        begin rst=1; tick=1; mode_select=adaptive;ped_button=0;step;
            check(state==0 && elapsed==0 && !ped_pending,"Reset state and request");
            check(mode_active==adaptive,"Mode captured by reset");rst=0;
        end
    endtask
    task reach(input integer target);
        integer n;
        begin n=0; while(state!=target && n<100) begin step;n=n+1;end
            check(state==target,"Target state reachable");
        end
    endtask
    task hold_phase(input integer code,input integer duration,input integer next_code);
        integer n;
        begin check(state==code && elapsed==0,"Phase entry");
            for(n=1;n<duration;n=n+1) begin
                step;check(state==code && elapsed==n,"Phase held with exact elapsed tick");
            end
            step;check(state==next_code && elapsed==0,"Phase exact duration");
        end
    endtask
    initial begin
        $dumpfile("build/controller.vcd");$dumpvars(0,tb_controller);
        // Complete fixed cycle with exact durations; queue values cannot alter fixed mode.
        reset_to(0);queue_a=0;queue_b=200;
        hold_phase(0,1,1); hold_phase(1,12,2);hold_phase(2,3,3);hold_phase(3,1,4);
        hold_phase(4,12,5);hold_phase(5,3,6);hold_phase(6,1,1);
        $display("PASS fixed cycle and exact timing");
        mode_select=1;repeat(4)step;check(!mode_active,"Mode selection ignored until reset");
        tick=0;old_state=state;i=elapsed;repeat(5)step;
        check(state==old_state && elapsed==i,"No phase time progression without tick");
        ped_button=1;step;check(ped_pending,"Button captured even without tick");ped_button=0;tick=1;
        reach(7);hold_phase(7,6,8);hold_phase(8,1,4);
        check(!ped_pending,"Serviced request cleared");
        $display("PASS asynchronous-to-tick request capture and pedestrian after A");
        // Minimum green, dynamic queue change, maximum green and zero demand.
        reset_to(1);queue_a=0;queue_b=10;reach(1);hold_phase(1,6,2);
        reset_to(1);queue_a=10;queue_b=0;reach(1);repeat(8)step;
        check(state==1,"Own demand retains green");queue_a=1;queue_b=8;step;check(state==2,"Demand change ends green after minimum");
        reset_to(1);queue_a=200;queue_b=1;reach(1);hold_phase(1,20,2);
        reset_to(1);queue_a=0;queue_b=0;reach(1);hold_phase(1,20,2);
        $display("PASS adaptive minimum maximum and queue changes");
        // Press at decision boundary: must not lose a same-cycle request.
        reset_to(0);reach(3);ped_button=1;step;check(state==7,"Boundary request served");
        repeat(6)step;check(state==8,"Held button cannot extend walk");step;
        check(state==4 && !ped_pending,"Resume B after A and no held-button repeat");
        reach(6);step;check(state==1,"No duplicate walk on held button");
        ped_button=0;step;reach(4);ped_button=1;step;ped_button=0;reach(7);
        hold_phase(7,6,8);hold_phase(8,1,1);
        $display("PASS held button and correct resume after B");
        // Requests during WALK are ignored, but during clearance are retained.
        reset_to(0);ped_button=1;step;ped_button=0;reach(7);
        ped_button=1;step;ped_button=0;step;check(!ped_pending,"Request during walk ignored");
        reach(8);ped_button=1;step;ped_button=0;
        check(state==4 && ped_pending,"Request during clearance retained");reach(7);
        // Reset from every state, including WALK/CLEAR.
        for(j=0;j<=8;j=j+1) begin
            reset_to(0);
            if(j>=7) begin ped_button=1;step;ped_button=0;end
            reach(j);rst=1;mode_select=1;step;
            check(state==0 && lights_a==4 && lights_b==4 && !walk && !ped_pending,"Reset safe from every state");rst=0;
        end
        $display("PASS reset in all nine states");
        // A high level on release from reset is intentionally one new request.
        rst=1;tick=0;ped_button=1;
        repeat(3)step;
        check(state==0 && !ped_pending,"Reset wins while button is high");
        rst=0;step;
        check(state==0 && ped_pending,"Button held through reset captured on release without tick");
        $display("PASS tb_controller checks=%0d",checks);$finish;
    end
    initial begin #1000000;$fatal(1,"Controller test timeout");end

    // Independent output check at every clock, including clocks with tick=0.
    integer expected_remaining, remaining_checks=0;
    always @(posedge clk) begin
        #2;
        case(state)
            1,4: expected_remaining=mode_active ? 20 : 12;
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
