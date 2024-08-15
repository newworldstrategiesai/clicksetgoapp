import React from "react";

interface List {
  id: string;
  name: string;
  created_at: string;
}

interface ListsTable2Props {
  data: List[]; // Ensure data is always an array
}

const ListsTable2: React.FC<ListsTable2Props> = ({ data = [] }) => { // Default to empty array if data is undefined
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className="text-left p-2">Name</th>
          <th className="text-right p-2">Created At</th>
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={2} className="p-2 text-center">No data available</td>
          </tr>
        ) : (
          data.map((item) => (
            <tr key={item.id}>
              <td className="text-left p-2">{item.name}</td>
              <td className="text-right p-2">{new Date(item.created_at).toLocaleString()}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default ListsTable2;
