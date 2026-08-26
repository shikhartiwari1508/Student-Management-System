'''print("Electricity unit charges:")
print("1 Unit = 10 rs.")
print("10 Unit = 100 rs.")
print("100 Unit = 1000 rs.")

unit = int(input("Enter the unit:"))
if(unit):
    print(10*unit)

else:
    print("Please renter the unit.....")'''

    # OR
'''a= 10*unit
print(a)'''


''' write a python program to calculate electricity bill according to given criteria :
1 - 100 unit = 1.5 rs.
101 - 200 unit = 2.5 rs.
201 - 300 unit = 4 rs.
above 300 unit = 10 rs.'''

units = int(input("Enter the electricity unit consumed :"))
if units <=100:
    bill = units*1.5
elif units <=200:
    bill = (100*1.5)+((units - 100)*2.5)
elif units <=200:
    bill = (100*1.5)+( 100*2.5) + ((units -200)*4)
else:
    bill = (100*1.5)+(100*2.5)+(100*4)+((units-300)*10)
print("Electricity bill = Rs.", bill)        
                