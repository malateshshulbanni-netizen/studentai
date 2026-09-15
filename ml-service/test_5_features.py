import requests
import json

url = "http://localhost:8000/api/predict-batch"

# Test data with ALL 11 features from your dataset
data = {
    "students": [
        # Student 1: Very Low Risk (High performance)
        {
            "age": 20,
            "attendance_percentage": 95.0,
            "current_gpa": 9.2,
            "failed_subjects": 0,
            "backlogs": 0,
            "assignment_completion_percentage": 98.0,
            "internal_assessment_marks": 90.0,
            "exam_score": 92.0,
            "lms_activity_score": 95.0,
            "fee_pending": 0,
            "counseling_sessions": 0
        },
        # Student 2: Low Risk (Good performance)
        {
            "age": 21,
            "attendance_percentage": 85.0,
            "current_gpa": 8.5,
            "failed_subjects": 0,
            "backlogs": 0,
            "assignment_completion_percentage": 90.0,
            "internal_assessment_marks": 85.0,
            "exam_score": 88.0,
            "lms_activity_score": 90.0,
            "fee_pending": 0,
            "counseling_sessions": 1
        },
        # Student 3: Medium Risk (Average performance)
        {
            "age": 22,
            "attendance_percentage": 70.0,
            "current_gpa": 7.0,
            "failed_subjects": 1,
            "backlogs": 1,
            "assignment_completion_percentage": 75.0,
            "internal_assessment_marks": 72.0,
            "exam_score": 70.0,
            "lms_activity_score": 65.0,
            "fee_pending": 0,
            "counseling_sessions": 2
        },
        # Student 4: Medium-High Risk (Below average)
        {
            "age": 21,
            "attendance_percentage": 60.0,
            "current_gpa": 5.8,
            "failed_subjects": 2,
            "backlogs": 2,
            "assignment_completion_percentage": 65.0,
            "internal_assessment_marks": 60.0,
            "exam_score": 55.0,
            "lms_activity_score": 50.0,
            "fee_pending": 1,
            "counseling_sessions": 2
        },
        # Student 5: High Risk (Poor performance)
        {
            "age": 22,
            "attendance_percentage": 45.0,
            "current_gpa": 5.0,
            "failed_subjects": 3,
            "backlogs": 3,
            "assignment_completion_percentage": 45.0,
            "internal_assessment_marks": 45.0,
            "exam_score": 40.0,
            "lms_activity_score": 35.0,
            "fee_pending": 1,
            "counseling_sessions": 3
        },
        # Student 6: Very High Risk (Very poor performance)
        {
            "age": 23,
            "attendance_percentage": 35.0,
            "current_gpa": 4.2,
            "failed_subjects": 4,
            "backlogs": 4,
            "assignment_completion_percentage": 30.0,
            "internal_assessment_marks": 35.0,
            "exam_score": 30.0,
            "lms_activity_score": 25.0,
            "fee_pending": 1,
            "counseling_sessions": 4
        },
        # Student 7: Critical Risk (Extreme poor performance)
        {
            "age": 22,
            "attendance_percentage": 25.0,
            "current_gpa": 3.5,
            "failed_subjects": 5,
            "backlogs": 7,
            "assignment_completion_percentage": 20.0,
            "internal_assessment_marks": 25.0,
            "exam_score": 20.0,
            "lms_activity_score": 15.0,
            "fee_pending": 1,
            "counseling_sessions": 5
        }
    ]
}

print("=" * 70)
print("STUDENT DROPOUT PREDICTION BATCH TEST")
print("=" * 70)

print("\n[INFO] Sending prediction request with 7 students...")
print(f"[INFO] Each student has {len(data['students'][0])} features")

response = requests.post(url, json=data)

print("\n" + "=" * 70)
print("RESPONSE")
print("=" * 70)

print("\nStatus Code:", response.status_code)

if response.status_code == 200:
    result = response.json()
    
    print(f"\n[SUCCESS] Total students: {result['total_students']}")
    print("\n[PREDICTIONS]")
    print("-" * 70)
    
    for i, student_result in enumerate(result['results']):
        print(f"\nStudent {i+1}:")
        print(f"  Prediction: {'DROPOUT' if student_result['prediction'] == 1 else 'WILL GRADUATE'}")
        print(f"  Probability: {student_result['probability']:.2%}")
        print(f"  Risk Level: {student_result['risk_level']}")
        print(f"  Features Used: {len(student_result['used_features'])}")
        print(f"  Missing Features: {student_result['missing_features']}")
        
        if student_result.get('error'):
            print(f"  Error: {student_result['error']}")
else:
    print(f"\n[ERROR] Request failed: {response.text}")

print("\n" + "=" * 70)