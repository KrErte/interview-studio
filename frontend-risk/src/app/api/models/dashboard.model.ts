export interface DashboardTraining {
  completedTasks?: number | null;
  totalTasks?: number | null;
  progressPercent?: number | null;
  nextTaskTitle?: string | null;
}

export interface DashboardJobAnalysis {
  id?: string | null;
  role?: string | null;
  scorePercent?: number | null;
  createdAt?: string | null;
  summary?: string | null;
}

export interface DashboardResponse {
  training?: DashboardTraining | null;
  jobAnalyses?: DashboardJobAnalysis[] | null;
  profileSummary?: string | null;
  cvSummary?: string | null;
  skillProfileSummary?: string | null;
}





