import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function BarChartHorizontal({ data }) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-xs font-bold text-slate-400">Data Brand kosong</div>;
  }

  return (
    <div className="w-full h-36">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
          <XAxis type="number" tick={{ fontSize: 9 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 8 }} width={70} />
          <Tooltip formatter={(value) => [`${value} Record`, 'Jumlah']} />
          <Bar dataKey="value" fill="#dc2626" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}