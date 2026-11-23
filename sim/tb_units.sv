`timescale 1ns/1ps
module tb_units;
    reg mode=0;reg [15:0] elapsed=0;reg [7:0] own=0,other=0;
    wire done;wire [1:0] level;
    green_policy p(mode,elapsed,own,other,done);
    demand_level d(own,level);
    integer m,e,a,b,checks=0;reg expected;
    // Exhaustive small-domain policy decision checks, including all time boundaries.
    initial begin
        for(m=0;m<2;m=m+1)
        for(e=0;e<25;e=e+1)
        for(a=0;a<16;a=a+1)
        for(b=0;b<16;b=b+1)begin
            mode=m;elapsed=e;own=a;other=b;#1;
            if(!m) expected=(e+1>=12);
            else if(e+1<6)expected=0;
            else if(e+1>=20)expected=1;
            else expected=(b>a);
            if(done!==expected)$fatal(1,"Policy mismatch mode=%0d seconds=%0d own=%0d other=%0d",m,e+1,a,b);
            checks=checks+1;
        end
        for(a=0;a<256;a=a+1)begin
            own=a;#1;
            if(level!==((a==0)?0:(a<4)?1:(a<10)?2:3))$fatal(1,"Demand classification mismatch");
            checks=checks+1;
        end
        $display("PASS tb_units checks=%0d",checks);$finish;
    end
endmodule
