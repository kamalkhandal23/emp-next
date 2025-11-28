const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://emp-hee877vkc-teamoflifeboxs-projects.vercel.app'
    : 'http://localhost:5002/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  setAuthToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Always get the latest token from localStorage
    this.token = localStorage.getItem('authToken');

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: 'Network error' }));
        // Handle the server's error response format
        const errorMessage =
          error.message ||
          error.data?.message ||
          `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return await response.text();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: credentials,
    });
    if (response.data && response.data.token) {
      this.setAuthToken(response.data.token);
      return response.data; // Return the data object containing user and token
    }
    return response;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.setAuthToken(null);
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: userData,
    });
    if (response.data && response.data.token) {
      this.setAuthToken(response.data.token);
      return response.data;
    }
    return response;
  }

  async getCurrentUser() {
    const response = await this.request('/auth/me');
    return response.data ? response.data.user : response;
  }

  // Employee endpoints
  async getEmployees() {
    return this.request('/employees');
  }

  async getEmployee(id) {
    return this.request(`/employees/${id}`);
  }

  async createEmployee(employeeData) {
    return this.request('/employees', {
      method: 'POST',
      body: employeeData,
    });
  }

  async updateEmployee(id, employeeData) {
    return this.request(`/employees/${id}`, {
      method: 'PUT',
      body: employeeData,
    });
  }

  async deleteEmployee(id) {
    return this.request(`/employees/${id}`, {
      method: 'DELETE',
    });
  }

  // Attendance endpoints
  async getAttendance(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/attendance${queryString ? `?${queryString}` : ''}`);
  }

  async checkIn() {
    return this.request('/attendance/checkin', {
      method: 'POST',
    });
  }

  async checkOut() {
    return this.request('/attendance/checkout', {
      method: 'POST',
    });
  }

  async getMyAttendance() {
    return this.request('/attendance/my');
  }

  // Get lecture videos for NextGen Education
    async getNextGenLectureVideos(id){
        console.log(id,"api lecture student id");
        return this.request(`/nextgen/lectureVideo/student/${id}`);
    }

    //get student leader board
    async getNextGenLeaderboard(courseId){
      console.log("abs");
      return this.request(`/nextgen/leaderboard/student/${courseId}`);

    }



  // Tasks endpoints
  async getTasks(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/tasks${queryString ? `?${queryString}` : ''}`);
  }

  async getTask(id) {
    return this.request(`/tasks/${id}`);
  }

  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: taskData,
    });
  }

  async updateTask(id, taskData) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: taskData,
    });
  }

  async deleteTask(id) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async getMyTasks() {
    return this.request('/tasks/my');
  }

  // Projects endpoints
  async getProjects() {
    const response = await this.request('/projects');
    return response.data || response;
  }

  async getProject(id) {
    return this.request(`/projects/${id}`);
  }

  async createProject(projectData) {
    return this.request('/projects', {
      method: 'POST',
      body: projectData,
    });
  }

  async updateProject(id, projectData) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: projectData,
    });
  }

  async deleteProject(id) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Teams endpoints
  async getTeams() {
    return this.request('/teams');
  }

  async getTeam(id) {
    return this.request(`/teams/${id}`);
  }

  async createTeam(teamData) {
    return this.request('/teams', {
      method: 'POST',
      body: teamData,
    });
  }

  async updateTeam(id, teamData) {
    return this.request(`/teams/${id}`, {
      method: 'PUT',
      body: teamData,
    });
  }

  async deleteTeam(id) {
    return this.request(`/teams/${id}`, {
      method: 'DELETE',
    });
  }

  async getMyTeam() {
    return this.request('/teams/my');
  }

  // Leave endpoints
  async getLeaves(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/leaves${queryString ? `?${queryString}` : ''}`);
  }

  async createLeave(leaveData) {
    return this.request('/leaves', {
      method: 'POST',
      body: leaveData,
    });
  }

  async updateLeave(id, leaveData) {
    return this.request(`/leaves/${id}`, {
      method: 'PUT',
      body: leaveData,
    });
  }

  async approveLeave(id) {
    return this.request(`/leaves/${id}/approve`, {
      method: 'POST',
    });
  }

  async rejectLeave(id, reason) {
    return this.request(`/leaves/${id}/reject`, {
      method: 'POST',
      body: { reason },
    });
  }

  async getMyLeaves() {
    return this.request('/leaves/my');
  }

  // Meetings endpoints
  async getMeetings() {
    return this.request('/meetings');
  }

  async createMeeting(meetingData) {
    return this.request('/meetings', {
      method: 'POST',
      body: meetingData,
    });
  }

  async updateMeeting(id, meetingData) {
    return this.request(`/meetings/${id}`, {
      method: 'PUT',
      body: meetingData,
    });
  }

  async deleteMeeting(id) {
    return this.request(`/meetings/${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async getAdminDashboard() {
    return this.request('/dashboard/admin');
  }

  async getHRDashboard() {
    return this.request('/dashboard/hr');
  }

  async getManagerDashboard() {
    return this.request('/dashboard/manager');
  }

  async getTeamLeadDashboard() {
    return this.request('/dashboard/teamlead');
  }

  async getEmployeeDashboard() {
    return this.request('/dashboard/employee');
  }

  // NextGen Education endpoints
  async getNextGenCourses() {
    return this.request('/nextgen/courses');
  }

  async enrollInCourse(courseData) {
    return this.request('/nextgen/enroll', {
      method: 'POST',
      body: courseData,
    });
  }

  async getNextGenExams() {
    return this.request('/nextgen/exams');
  }

  async submitExam(examData) {
    return this.request('/nextgen/exams/submit', {
      method: 'POST',
      body: examData,
    });
  }

  async getNextGenResults() {
    return this.request('/nextgen/results');
  }

  // Employee Portal specific endpoints
  async getEmployeePortalDashboard() {
    return this.request('/employee-portal/dashboard');
  }

  async getEmployeePortalStatus() {
    return this.request('/employee-portal/status');
  }

  async employeeCheckIn() {
    return this.request('/employee-portal/timesheet/checkin', {
      method: 'POST',
    });
  }

  async employeeCheckOut() {
    return this.request('/employee-portal/timesheet/checkout', {
      method: 'POST',
    });
  }

  async startBreak() {
    return this.request('/employee-portal/timesheet/break/start', {
      method: 'POST',
    });
  }

  async endBreak() {
    return this.request('/employee-portal/timesheet/break/end', {
      method: 'POST',
    });
  }

  async addWorkLog(workLogData) {
    return this.request('/employee-portal/worklog', {
      method: 'POST',
      body: workLogData,
    });
  }

  async getAttendanceReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/employee-portal/attendance/report${
        queryString ? `?${queryString}` : ''
      }`
    );
  }

  async getMonthlySummary(month, year) {
    return this.request(
      `/employee-portal/attendance/monthly-summary?month=${month}&year=${year}`
    );
  }

  async getAttendanceAnomalies() {
    return this.request('/employee-portal/attendance/anomalies');
  }

  async getEmployeeProfile() {
    return this.request('/employee-portal/profile');
  }

  async updateEmployeeProfile(profileData) {
    return this.request('/employee-portal/profile', {
      method: 'PUT',
      body: profileData,
    });
  }

  async getEmployeePerformance() {
    return this.request('/employee-portal/performance');
  }

  async getEmployeeBenefits() {
    return this.request('/employee-portal/benefits');
  }

  // File upload
  async uploadFile(file, type = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request('/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it
      },
    });
  }

  // NextGen Exam endpoints
  async createNextGenExam(examData) {
    return this.request('/nextgen/exams/create', {
      method: 'POST',
      body: examData,
    });
  }

  async getAllNextGenExams(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/nextgen/exams${queryString ? `?${queryString}` : ''}`
    );
  }

  async getNextGenExamById(id) {
    return this.request(`/nextgen/exams/id/${id}`);
  }

  async getNextGenExamByName(examName) {
    return this.request(`/nextgen/exams/name/${encodeURIComponent(examName)}`);
  }

  async updateNextGenExamStatus(id, status) {
    return this.request(`/nextgen/exams/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }

  async deleteNextGenExam(id) {
    return this.request(`/nextgen/exams/${id}`, {
      method: 'DELETE',
    });
  }

  async updateNextGenExam(id, examData) {
    return this.request(`/nextgen/exams/${id}`, {
      method: 'PUT',
      body: examData,
    });
  }

  // NextGen Coding Exam endpoints
  async createNextGenCodingExam(examData) {
    return this.request('/nextgen/codingExams/create', {
      method: 'POST',
      body: examData,
    });
  }

  async getAllNextGenCodingExams(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/nextgen/codingExams${queryString ? `?${queryString}` : ''}`
    );
  }

  async getNextGenCodingExamById(id) {
    return this.request(`/nextgen/codingExams/id/${id}`);
  }

  async getNextGenCodingExamByName(examName) {
    return this.request(
      `/nextgen/codingExams/name/${encodeURIComponent(examName)}`
    );
  }

  async updateNextGenCodingExamStatus(id, status) {
    return this.request(`/nextgen/codingExams/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }

  async updateNextGenCodingExam(id, examData) {
    return this.request(`/nextgen/codingExams/${id}`, {
      method: 'PUT',
      body: examData,
    });
  }

  async deleteNextGenCodingExam(id) {
    return this.request(`/nextgen/codingExams/${id}`, {
      method: 'DELETE',
    });
  }

  // Run coding exam code on sample inputs
  async runCodingExamCode(data) {
    return this.request('/nextgen/codingExams/run-code', {
      method: 'POST',
      body: data,
    });
  }

  // Submit coding exam
  async submitCodingExam(data) {
    return this.request('/nextgen/codingExams/submit', {
      method: 'POST',
      body: data,
    });
  }

  // NextGen Assignment endpoints
  async createNextGenAssignment(assignmentData) {
    return this.request('/nextgen/assignments/create', {
      method: 'POST',
      body: assignmentData,
    });
  }

  async getAllNextGenAssignments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/nextgen/assignments${queryString ? `?${queryString}` : ''}`
    );
  }

  async getNextGenAssignmentById(id) {
    return this.request(`/nextgen/assignments/id/${id}`);
  }

  async updateNextGenAssignmentStatus(id, status) {
    return this.request(`/nextgen/assignments/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }

  async updateNextGenAssignment(id, assignmentData) {
    return this.request(`/nextgen/assignments/${id}`, {
      method: 'PUT',
      body: assignmentData,
    });
  }

  async deleteNextGenAssignment(id) {
    return this.request(`/nextgen/assignments/${id}`, {
      method: 'DELETE',
    });
  }

  async getAssignmentsWithLockStatus(studentId, courseName = null) {
    const queryString = courseName ? `?courseName=${courseName}` : '';
    return this.request(
      `/nextgen/assignments/student/${studentId}${queryString}`
    );
  }

  // Assignment Submission endpoints
  async submitAssignment(formData) {
    // FormData requires special handling
    const url = `${this.baseURL}/nextgen/assignment-submissions/submit`;
    this.token = localStorage.getItem('authToken');

    const config = {
      method: 'POST',
      headers: {},
      body: formData,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: 'Network error' }));
        throw new Error(
          error.message || `HTTP error! status: ${response.status}`
        );
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getSubmission(assignmentId, studentId) {
    return this.request(
      `/nextgen/assignment-submissions/${assignmentId}/student/${studentId}`
    );
  }

  async saveQuestionAnswer(assignmentId, studentId, questionKey, answer) {
    return this.request('/nextgen/assignment-submissions/save-answer', {
      method: 'POST',
      body: { assignmentId, studentId, questionKey, answer },
    });
  }

  async getAssignmentSubmissions(assignmentId, status = null) {
    const queryString = status ? `?status=${status}` : '';
    return this.request(
      `/nextgen/assignment-submissions/${assignmentId}/submissions${queryString}`
    );
  }

  async gradeSubmission(submissionId, gradeData) {
    return this.request(
      `/nextgen/assignment-submissions/${submissionId}/grade`,
      {
        method: 'POST',
        body: gradeData,
      }
    );
  }

  async getStudentSubmissionHistory(
    studentId,
    status = null,
    courseName = null
  ) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (courseName) params.append('courseName', courseName);
    const queryString = params.toString();
    return this.request(
      `/nextgen/assignment-submissions/student/${studentId}/history${
        queryString ? `?${queryString}` : ''
      }`
    );
  }

  // NextGen Student Authentication
  async nextGenStudentLogin(credentials) {
    const response = await this.request('/nextgen/student/login', {
      method: 'POST',
      body: credentials,
    });
    if (response.data && response.data.token) {
      this.setAuthToken(response.data.token);
      // Store student info
      localStorage.setItem('userRole', 'student');
      localStorage.setItem(
        'studentInfo',
        JSON.stringify(response.data.student)
      );
    }
    return response;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
