`timescale 1ns/1ps
module traffic_controller #(
    parameter integer FIXED_GREEN=12, MIN_GREEN=6, MAX_GREEN=20,
    parameter integer YELLOW=3, ALL_RED=1, WALK_TIME=6, CLEAR_TIME=1
)(
    input wire clk, rst, tick, mode_select, ped_button,
    input wire [7:0] queue_a, queue_b,
    output reg [3:0] state,
    output reg [15:0] elapsed,
    output reg mode_active, ped_pending,
    output wire [2:0] lights_a, lights_b,
    output wire walk,
    output reg [15:0] remaining
);
    // Lamp encoding is {red,yellow,green}. State codes are stable for waveform use.
    localparam BOOT=0, A_GREEN=1, A_YELLOW=2, AFTER_A=3,
               B_GREEN=4, B_YELLOW=5, AFTER_B=6, PED_WALK=7, PED_CLEAR=8;
    reg button_prev, resume_b;
    wire new_request = ped_button && !button_prev;
    wire end_a, end_b;
    green_policy #(FIXED_GREEN,MIN_GREEN,MAX_GREEN) pa
        (mode_active,elapsed,queue_a,queue_b,end_a);
    green_policy #(FIXED_GREEN,MIN_GREEN,MAX_GREEN) pb
        (mode_active,elapsed,queue_b,queue_a,end_b);
    reg [3:0] next_state;
    always @* begin
        next_state=state;
        case(state)
            BOOT: if(elapsed >= ALL_RED-1) next_state=A_GREEN;
            A_GREEN: if(end_a) next_state=A_YELLOW;
            A_YELLOW: if(elapsed >= YELLOW-1) next_state=AFTER_A;
            AFTER_A: if(elapsed >= ALL_RED-1)
                next_state=(ped_pending || new_request) ? PED_WALK : B_GREEN;
            B_GREEN: if(end_b) next_state=B_YELLOW;
            B_YELLOW: if(elapsed >= YELLOW-1) next_state=AFTER_B;
            AFTER_B: if(elapsed >= ALL_RED-1)
                next_state=(ped_pending || new_request) ? PED_WALK : A_GREEN;
            PED_WALK: if(elapsed >= WALK_TIME-1) next_state=PED_CLEAR;
            PED_CLEAR: if(elapsed >= CLEAR_TIME-1) next_state=resume_b ? B_GREEN : A_GREEN;
            default: next_state=BOOT;
        endcase
    end
    always @(posedge clk) begin
        if(rst) begin
            state<=BOOT; elapsed<=0; mode_active<=mode_select;
            ped_pending<=0; button_prev<=0; resume_b<=0;
        end else begin
            button_prev<=ped_button;
            // A rising edge during WALK is ignored; holding the button never repeats.
            if(new_request && state!=PED_WALK) ped_pending<=1;
            if(tick) begin
                if(next_state!=state) begin
                    state<=next_state; elapsed<=0;
                    if(next_state==PED_WALK) begin
                        ped_pending<=0;
                        resume_b<=(state==AFTER_A);
                    end
                end else if(elapsed != 16'hffff) elapsed<=elapsed+1'b1;
            end
        end
    end
    assign lights_a=(state==A_GREEN) ? 3'b001 : (state==A_YELLOW) ? 3'b010 : 3'b100;
    assign lights_b=(state==B_GREEN) ? 3'b001 : (state==B_YELLOW) ? 3'b010 : 3'b100;
    assign walk=(state==PED_WALK);
    integer limit;
    always @* begin
        case(state)
            A_GREEN,B_GREEN: limit=mode_active ? MAX_GREEN : FIXED_GREEN;
            A_YELLOW,B_YELLOW: limit=YELLOW;
            PED_WALK: limit=WALK_TIME;
            PED_CLEAR: limit=CLEAR_TIME;
            default: limit=ALL_RED;
        endcase
        // Adaptive green reports remaining upper bound, not a promised duration.
        remaining=(elapsed<limit) ? limit-elapsed : 0;
    end
endmodule
