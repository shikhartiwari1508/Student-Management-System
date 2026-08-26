import json
import os

FILE = "students.json"

# Load Data
def load_data():
    if os.path.exists(FILE):
        with open(FILE, "r") as f:
            return json.load(f)
    return []

# Save Data
def save_data(data):
    with open(FILE, "w") as f:
        json.dump(data, f, indent=4)

# Add Student
def add_student():
    data = load_data()

    roll = input("Enter Roll No: ")
    name = input("Enter Name: ")
    course = input("Enter Course: ")
    marks = input("Enter Marks: ")

    student = {
        "Roll": roll,
        "Name": name,
        "Course": course,
        "Marks": marks
    }

    data.append(student)
    save_data(data)
    print("\nStudent Added Successfully!")

# View Students
def view_students():
    data = load_data()

    if not data:
        print("\nNo Student Records Found!")
        return

    print("\n------ Student Records ------")
    for s in data:
        print(f"Roll: {s['Roll']}")
        print(f"Name: {s['Name']}")
        print(f"Course: {s['Course']}")
        print(f"Marks: {s['Marks']}")
        print("-" * 30)

# Search Student
def search_student():
    data = load_data()
    roll = input("Enter Roll No to Search: ")

    for s in data:
        if s["Roll"] == roll:
            print("\nStudent Found!")
            print(s)
            return

    print("Student Not Found!")

# Update Student
def update_student():
    data = load_data()
    roll = input("Enter Roll No to Update: ")

    for s in data:
        if s["Roll"] == roll:
            s["Name"] = input("Enter New Name: ")
            #s["Roll"] = input("Enter New Roll No.: ")
            s["Course"] = input("Enter New Course: ")
            s["Marks"] = input("Enter New Marks: ")
            save_data(data)
            print("Student Updated Successfully!")
            return

    print("Student Not Found!")

# Delete Student
def delete_student():
    data = load_data()
    roll = input("Enter Roll No to Delete: ")

    for s in data:
        if s["Roll"] == roll:
            data.remove(s)
            save_data(data)
            print("Student Deleted Successfully!")
            return

    print("Student Not Found!")

# Main Menu
while True:
    print("\n===== STUDENT MANAGEMENT SYSTEM =====")
    print("1. Add Student")
    print("2. View Students")
    print("3. Search Student")
    print("4. Update Student")
    print("5. Delete Student")
    print("6. Exit")

    choice = input("Enter Your Choice: ")

    if choice == "1":
        add_student()
    elif choice == "2":
        view_students()
    elif choice == "3":
        search_student()
    elif choice == "4":
        update_student()
    elif choice == "5":
        delete_student()
    elif choice == "6":
        print("Thank You!")
        break
    else:
        print("Invalid Choice!")