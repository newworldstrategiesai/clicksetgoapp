import React from 'react';
import { X } from 'lucide-react';
import moment from 'moment';

interface CallTask {
  id: string;
  call_sid: string;
  call_tasks_id: string;
  caller_number: string;
  created_at: string;
  end_time: string;
  start_time: string;
  status: string;
  summary: string;
  transcript: string;
  recording_url: string;
  stereo_recording_url: string;
  analysis: string;
  user_id: string;
  updated_at: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: CallTask | null;
}

const CallTaskModal = ({ isOpen, onClose, task }: ModalProps) => {
  console.log("task", task);
  if (!isOpen || !task) return null;

  const formatDate = (date: string) => {
    return moment.tz(date, 'UTC').local().format('YYYY-MM-DD HH:mm:ss');
  };

  const calculateDuration = (start: string, end: string) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const duration = (endTime.getTime() - startTime.getTime()) / 1000; // in seconds
    return `${Math.floor(duration)} seconds`;
  };

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/(\+\d{2})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
  };

  try {
    const parseJSONSafely = (jsonString: string) => {
      try {
        return JSON.parse(jsonString);
      } catch {
        console.error("Invalid JSON string:", jsonString);
        return null;
      }
    };
    
    const analysis = task.analysis ? parseJSONSafely(task.analysis) : null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Call Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={24} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6">
            {/* Call Overview Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Call Status
                </label>
                <p className="mt-1 text-gray-900 dark:text-gray-100 capitalize">
                  {task.status}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Caller Number
                </label>
                <p className="mt-1 text-gray-900 dark:text-gray-100">
                  {task.caller_number}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Start Time
                </label>
                <p className="mt-1 text-gray-900 dark:text-gray-100">
                  {formatDate(task.start_time)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  End Time
                </label>
                <p className="mt-1 text-gray-900 dark:text-gray-100">
                  {formatDate(task.end_time)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Duration
                </label>
                <p className="mt-1 text-gray-900 dark:text-gray-100">
                  {calculateDuration(task.start_time, task.end_time)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Call ID
                </label>
                <p className="mt-1 text-gray-900 dark:text-gray-100">
                  {task.call_sid}
                </p>
              </div>
            </div>

            {/* Summary Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Call Summary
              </label>
              <p className="mt-1 text-gray-900 dark:text-gray-100 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                {task.summary}
              </p>
            </div>

            {/* Analysis Section */}
            {analysis && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Analysis
                </label>
                <div className="mt-1 space-y-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <p className="text-gray-900 dark:text-gray-100">
                    {analysis.summary}
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">
                    Success: {analysis.successEvaluation}
                  </p>
                </div>
              </div>
            )}

            {/* Transcript Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Transcript
              </label>
              <pre className="mt-1 text-gray-900 dark:text-gray-100 p-3 bg-gray-50 dark:bg-gray-700 rounded-md whitespace-pre-wrap font-sans">
                {task.transcript}
              </pre>
            </div>

            {/* Recording Section */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Recordings
              </label>
              <div className="flex flex-col space-y-2">
                <audio controls className="w-full">
                  <source src={task.recording_url} type="audio/wav" />
                  Your browser does not support the audio element.
                </audio>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Mono Recording
                </p>
              </div>
              <div className="flex flex-col space-y-2">
                <audio controls className="w-full">
                  <source src={task.stereo_recording_url} type="audio/wav" />
                  Your browser does not support the audio element.
                </audio>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Stereo Recording
                </p>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-4 p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering modal:', error);
    return null;
  }
};

export default CallTaskModal;