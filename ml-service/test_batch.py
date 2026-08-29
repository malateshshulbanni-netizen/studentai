import requests
import json

url = "http://localhost:8000/api/predict-batch"

data = {
    "students": [
        {
            "attendance": 85,
            "gpa": 8.5,
            "backlogs": 0,
            "assignment_completion": 90,
            "engagement": "High"
        },
        {
            "attendance": 35,
            "gpa": 4.2,
            "backlogs": 4,
            "assignment_completion": 30,
            "engagement": "Low"
        },
        {
            "attendance": 60,
            "gpa": 5.8,
            "backlogs": 2,
            "assignment_completion": 65,
            "engagement": "Medium"
        }
    ]
}

response = requests.post(url, json=data)
print("Status Code:", response.status_code)
print("Response:")
print(json.dumps(response.json(), indent=2))