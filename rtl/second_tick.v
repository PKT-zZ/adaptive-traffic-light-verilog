`timescale 1ns/1ps
module second_tick #(parameter integer CYCLES_PER_SECOND=50_000_000)(
    input wire clk,rst, output wire tick
);
    localparam integer WIDTH=(CYCLES_PER_SECOND<=1) ? 1 : $clog2(CYCLES_PER_SECOND);
    reg [WIDTH-1:0] counter;
    assign tick=!rst && (counter==CYCLES_PER_SECOND-1);
    always @(posedge clk) begin
        if(rst || tick) counter<=0;
        else counter<=counter+1'b1;
    end
endmodule
