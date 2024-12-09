import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  CircleIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons"
import { CalendarIcon, ListRestartIcon } from "lucide-react";

export const labels = [
  {
    value: "bug",
    label: "Bug",
  },
  {
    value: "feature",
    label: "Feature",
  },
  {
    value: "documentation",
    label: "Documentation",
  },
]

export const statuses = [
  {
    value: "Aborted",
    label: "Aborted",
    icon: CrossCircledIcon, // Representing a failed or terminated status
  },
  {
    value: "Completed",
    label: "Completed",
    icon: CheckCircledIcon, // Representing a finished status
  },
  {
    value: "Pending",
    label: "Pending",
    icon: CircleIcon, // Representing something awaiting action
  },
  {
    value: "Scheduled",
    label: "Scheduled",
    icon: CalendarIcon, // Representing a planned action (you might need to add this icon)
  },
];


export const priorities = [
  {
    label: "Low",
    value: "low",
    icon: ArrowDownIcon,
  },
  {
    label: "Medium",
    value: "medium",
    icon: ArrowRightIcon,
  },
  {
    label: "High",
    value: "high",
    icon: ArrowUpIcon,
  },
]
