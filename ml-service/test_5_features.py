import requests
import json

url = "http://localhost:8000/api/predict-batch"

data = {
    "students": [
        {
            "attendance": 95,
            "gpa": 9.2,
            "backlogs": 0,
            "assignment_completion": 98,
            "engagement": "High"
        },
        {
            "attendance": 85,
            "gpa": 8.5,
            "backlogs": 0,
            "assignment_completion": 90,
            "engagement": "High"
        },
        {
            "attendance": 70,
            "gpa": 7.0,
            "backlogs": 1,
            "assignment_completion": 75,
            "engagement": "Medium"
        },
        {
            "attendance": 60,
            "gpa": 5.8,
            "backlogs": 2,
            "assignment_completion": 65,
            "engagement": "Medium"
        },
        {
            "attendance": 45,
            "gpa": 5.0,
            "backlogs": 3,
            "assignment_completion": 45,
            "engagement": "Low"
        },
        {
            "attendance": 35,
            "gpa": 4.2,
            "backlogs": 4,
            "assignment_completion": 30,
            "engagement": "Low"
        },
        {
            "attendance": 25,
            "gpa": 3.5,
            "backlogs": 7,
            "assignment_completion": 20,
            "engagement": "Low"
        }
    ]
}

response = requests.post(url, json=data)

print("Status Code:", response.status_code)
print(json.dumps(response.json(), indent=2))