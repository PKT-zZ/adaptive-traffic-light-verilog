`timescale 1ns/1ps
module tb_top;
    reg clk=0;always #5 clk=~clk;
    reg rst=1,mode=0,button=0;reg [7:0] qa=0,qb=0;
    wire [2:0] la,lb;wire walk,active,pending;
    wire [3:0] state;wire [15:0] elapsed,remaining;
    traffic_top #(4) top(clk,rst,mode,button,qa,qb,la,lb,walk,active,pending,state,elapsed,remaining);
    integer checks=0,n;
    task cycle;
        reg [5:0] expected_lamps;
        begin @(posedge clk);#1;checks=checks+1;
            // Check the ordered pair on the wrapper ports, not just mutual exclusion.
            case(state)
                1: expected_lamps={3'd1,3'd4};
                2: expected_lamps={3'd2,3'd4};
                4: expected_lamps={3'd4,3'd1};
                5: expected_lamps={3'd4,3'd2};
                0,3,6,7,8: expected_lamps={3'd4,3'd4};
                default: $fatal(1,"Illegal top state %0d",state);
            endcase
            if({la,lb} !== expected_lamps)
                $fatal(1,"Top lamps state=%0d A=%0d B=%0d expected=%0d/%0d",
                       state,la,lb,expected_lamps[5:3],expected_lamps[2:0]);
            @(negedge clk);
        end
    endtask
    initial begin
        cycle;rst=0;
        for(n=1;n<4;n=n+1)begin cycle;if(state!=0)$fatal(1,"Boot tick early");end
        cycle;if(state!=1)$fatal(1,"Boot tick late");
        for(n=1;n<48;n=n+1)begin cycle;if(state!=1)$fatal(1,"Fixed green too short");end
        cycle;if(state!=2)$fatal(1,"Fixed green too long");
        for(n=1;n<12;n=n+1)begin cycle;if(state!=2)$fatal(1,"Yellow too short");end
        cycle;if(state!=3)$fatal(1,"Yellow too long");
        // One-clock button pulse between second ticks must be retained.
        button=1;cycle;button=0;
        if(!pending)$fatal(1,"Lost short pedestrian request");
        repeat(3)cycle;if(state!=7)$fatal(1,"Walk not entered after all-red");
        repeat(24)cycle;if(state!=8)$fatal(1,"Walk duration wrong");
        repeat(4)cycle;if(state!=4)$fatal(1,"Resume direction wrong");
        rst=1;mode=1;cycle;rst=0;qa=40;qb=0;
        repeat(4)cycle;if(state!=1 || !active)$fatal(1,"Adaptive top reset");
        repeat(80)cycle;if(state!=2)$fatal(1,"Adaptive maximum at divided clock");
        $display("PASS tb_top checks=%0d",checks);$finish;
    end

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
