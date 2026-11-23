`timescale 1ns/1ps
// Synthesizable controller wrapper. Queue estimates are external inputs.
module traffic_top #(parameter integer CYCLES_PER_SECOND=50_000_000)(
    input wire clk,rst,mode_select,ped_button,
    input wire [7:0] queue_a,queue_b,
    output wire [2:0] lights_a,lights_b,
    output wire walk,mode_active,ped_pending,
    output wire [3:0] state,
    output wire [15:0] elapsed,remaining
);
    wire tick;
    second_tick #(CYCLES_PER_SECOND) clock_divider(clk,rst,tick);
    traffic_controller controller(clk,rst,tick,mode_select,ped_button,
        queue_a,queue_b,state,elapsed,mode_active,ped_pending,
        lights_a,lights_b,walk,remaining);
endmodule
