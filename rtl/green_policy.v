`timescale 1ns/1ps
// Pure decision logic. Queue values are sampled before updates on this tick.
module green_policy #(
    parameter integer FIXED_GREEN=12, MIN_GREEN=6, MAX_GREEN=20
)(
    input wire adaptive,
    input wire [15:0] elapsed,
    input wire [7:0] own_queue, other_queue,
    output wire finish_green
);
    assign finish_green = adaptive
        ? ((elapsed >= MAX_GREEN-1) ||
           ((elapsed >= MIN_GREEN-1) && (other_queue > own_queue)))
        : (elapsed >= FIXED_GREEN-1);
endmodule
