from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import json
import os


# =========================================================
# CONFIGURATION
# =========================================================

FILE = "students.json"

app = FastAPI(
    title="Student Management System",
    description="Futuristic Student Management System API",
    version="1.0"
)


# =========================================================
# STATIC FILES
# =========================================================

app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static"
)


# =========================================================
# DATA MODEL
# =========================================================

class Student(BaseModel):
    Roll: str
    Name: str
    Course: str
    Marks: str


# =========================================================
# LOAD DATA
# =========================================================

def load_data():

    if os.path.exists(FILE):

        try:

            with open(FILE, "r") as f:
                return json.load(f)

        except json.JSONDecodeError:

            return []

    return []


# =========================================================
# SAVE DATA
# =========================================================

def save_data(data):

    with open(FILE, "w") as f:

        json.dump(
            data,
            f,
            indent=4
        )


# =========================================================
# HOME PAGE
# =========================================================

@app.get("/")
def home():

    return FileResponse(
        "static/index.html"
    )


# =========================================================
# GET ALL STUDENTS
# =========================================================

@app.get("/api/students")
def get_students():

    return load_data()


# =========================================================
# GET SINGLE STUDENT
# =========================================================

@app.get("/api/students/{roll}")
def get_student(roll: str):

    data = load_data()

    for student in data:

        if student["Roll"] == roll:

            return student

    raise HTTPException(
        status_code=404,
        detail="Student Not Found"
    )


# =========================================================
# ADD STUDENT
# =========================================================

@app.post("/api/students")
def add_student(student: Student):

    data = load_data()


    # Check duplicate roll number

    for existing in data:

        if existing["Roll"] == student.Roll:

            raise HTTPException(
                status_code=400,
                detail="Roll number already exists"
            )


    # Validate marks

    try:

        marks = float(student.Marks)

    except ValueError:

        raise HTTPException(
            status_code=400,
            detail="Marks must be a number"
        )


    if marks < 0 or marks > 100:

        raise HTTPException(
            status_code=400,
            detail="Marks must be between 0 and 100"
        )


    new_student = {

        "Roll": student.Roll,
        "Name": student.Name,
        "Course": student.Course,
        "Marks": student.Marks

    }


    data.append(new_student)

    save_data(data)


    return {
        "message": "Student Added Successfully!",
        "student": new_student
    }


# =========================================================
# UPDATE STUDENT
# =========================================================

@app.put("/api/students/{roll}")
def update_student(
    roll: str,
    student: Student
):

    data = load_data()


    for existing in data:

        if existing["Roll"] == roll:

            # New roll cannot conflict
            if student.Roll != roll:

                for other in data:

                    if other["Roll"] == student.Roll:

                        raise HTTPException(
                            status_code=400,
                            detail="New roll number already exists"
                        )


            try:

                marks = float(student.Marks)

            except ValueError:

                raise HTTPException(
                    status_code=400,
                    detail="Marks must be a number"
                )


            if marks < 0 or marks > 100:

                raise HTTPException(
                    status_code=400,
                    detail="Marks must be between 0 and 100"
                )


            existing["Roll"] = student.Roll
            existing["Name"] = student.Name
            existing["Course"] = student.Course
            existing["Marks"] = student.Marks


            save_data(data)


            return {
                "message": "Student Updated Successfully!",
                "student": existing
            }


    raise HTTPException(
        status_code=404,
        detail="Student Not Found"
    )


# =========================================================
# DELETE STUDENT
# =========================================================

@app.delete("/api/students/{roll}")
def delete_student(roll: str):

    data = load_data()


    for index, student in enumerate(data):

        if student["Roll"] == roll:

            deleted_student = data.pop(index)

            save_data(data)


            return {
                "message": "Student Deleted Successfully!",
                "student": deleted_student
            }


    raise HTTPException(
        status_code=404,
        detail="Student Not Found"
    )


# =========================================================
# STATISTICS
# =========================================================

@app.get("/api/stats")
def get_stats():

    data = load_data()


    total_students = len(data)


    courses = set(
        student["Course"]
        for student in data
    )


    marks = []

    for student in data:

        try:

            marks.append(
                float(student["Marks"])
            )

        except:

            pass


    if marks:

        average_marks = round(
            sum(marks) / len(marks),
            1
        )

        top_marks = max(marks)

    else:

        average_marks = 0
        top_marks = 0


    return {

        "totalStudents":
            total_students,

        "totalCourses":
            len(courses),

        "averageMarks":
            average_marks,

        "topMarks":
            top_marks

    }
@app.get("/api/analytics")
def get_analytics():

    data = load_data()

    # Course-wise count
    course_data = {}

    for student in data:

        course = student["Course"]

        if course not in course_data:
            course_data[course] = 0

        course_data[course] += 1


    # Marks distribution

    marks_distribution = {
        "90-100": 0,
        "80-89": 0,
        "70-79": 0,
        "60-69": 0,
        "40-59": 0,
        "0-39": 0
    }


    pass_count = 0
    fail_count = 0


    for student in data:

        try:
            marks = float(student["Marks"])
        except:
            continue


        if marks >= 90:
            marks_distribution["90-100"] += 1

        elif marks >= 80:
            marks_distribution["80-89"] += 1

        elif marks >= 70:
            marks_distribution["70-79"] += 1

        elif marks >= 60:
            marks_distribution["60-69"] += 1

        elif marks >= 40:
            marks_distribution["40-59"] += 1

        else:
            marks_distribution["0-39"] += 1


        if marks >= 40:
            pass_count += 1
        else:
            fail_count += 1


    # Top students

    top_students = sorted(
        data,
        key=lambda x: float(x["Marks"]),
        reverse=True
    )[:5]


    return {

        "courseData": course_data,

        "marksDistribution":
            marks_distribution,

        "performance": {
            "pass": pass_count,
            "fail": fail_count
        },

        "topStudents": top_students

    }