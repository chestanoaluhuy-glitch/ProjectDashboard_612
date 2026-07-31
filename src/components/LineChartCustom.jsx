import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function LineChartCustom({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs font-bold text-slate-400">
        Data trend tidak tersedia
      </div>
    );
  }

  return (
    <div className="w-full h-36">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 8 }} angle={-20} textAnchor="end" />
          <YAxis tick={{ fontSize: 8 }} />
          <Tooltip formatter={(value) => [`${value} Record`, 'Total']} />
          <Line type="monotone" dataKey="value" stroke="#dc2626" strokeWidth={2} dot={{ r: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}