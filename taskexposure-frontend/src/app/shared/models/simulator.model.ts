/*
 * Copyright 2025 TASKEXPOSURE
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export type SimulatorTab = 'skill' | 'ai-capability';

export interface SimulatorOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'skill' | 'ai-capability';
}

export interface AffectedTask {
  taskDescription: string;
  currentExposure: number;
  newExposure: number;
  delta: number;
}

export interface SimulationResult {
  optionId: string;
  optionName: string;
  currentExposure: number;
  newExposure: number;
  delta: number;
  affectedTasks: AffectedTask[];
}

export interface SimulatorOptionsResponse {
  skills: SimulatorOption[];
  aiCapabilities: SimulatorOption[];
}

export interface SimulateRequest {
  sessionId?: string;
  optionId: string;
  currentExposure: number;
  tasks: { description: string; exposure: string }[];
}
