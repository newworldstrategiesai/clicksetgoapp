// components/ui/Table.tsx
import React from "react";

export const Table: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <table className="min-w-full bg-gray-800 text-white">{children}</table>;
};

export const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <thead className="bg-gray-700">{children}</thead>;
};

export const TableRow: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <tr>{children}</tr>;
};

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return <td className={`p-4 border-b border-gray-700 ${className}`}>{children}</td>;
};

export const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <tbody>{children}</tbody>;
};

