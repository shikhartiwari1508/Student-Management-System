a = int(input("Enter the first number :"))
b = int(input("Enter the Second number :"))

print("Select operation : ")
print("1. Add")
print("2. Subtract")
print("3. Multiply")
print("4. Division")

choice = input("Enter Choice ( 1 / 2 / 3 / 4 ) :")
if choice == "1":
    result = a+b
    print("Result :" , result)

elif choice == "2":
    result = a-b
    print("Result :" , result)

elif choice == "3":
    result = a*b
    print("Result :" , result) 

elif choice == "4":
    if b == 0:
     print("Error! Division by zero ")
    else:
        result = a/b
        print("Result :" , result)

else:
    print("Invalid Number...")   


    
'''print("Sum : ")
print("The sum of First and Second number is :", a+b)
print("Subtraction : ")
print("The sum of First and Second number is :", a-b)
print("Multiplication : ")
print("The sum of First and Second number is :", a*b)
print("Division : ")
print("The sum of First and Second number is :", a/b)'''

