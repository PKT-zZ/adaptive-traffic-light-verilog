`timescale 1ns/1ps
// Display classification; controller still compares the exact queue counts.
module demand_level(input wire [7:0] queue, output wire [1:0] level);
    assign level=(queue==0) ? 0 : (queue<=3) ? 1 : (queue<=9) ? 2 : 3;
endmodule
