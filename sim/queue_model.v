`timescale 1ns/1ps
// Simulation traffic model; not an actual sensor. Each green serves one car / 2s.
module queue_model #(parameter integer SERVICE_SECONDS=2)(
    input wire clk,rst,tick,green,
    input wire [3:0] arrivals,
    output reg [7:0] queue,
    output wire departed,
    output reg overflow
);
    reg [15:0] service_elapsed;
    integer updated;
    assign departed=!rst && tick && green && queue!=0 && service_elapsed==SERVICE_SECONDS-1;
    always @(posedge clk) begin
        if(rst) begin queue<=0; service_elapsed<=0; overflow<=0; end
        else if(tick) begin
            if(!green || queue==0 || service_elapsed==SERVICE_SECONDS-1) service_elapsed<=0;
            else service_elapsed<=service_elapsed+1'b1;
            updated=queue+arrivals-(departed ? 1 : 0);
            overflow<=(updated>255);
            queue<=(updated>255) ? 255 : updated;
        end
    end
endmodule
