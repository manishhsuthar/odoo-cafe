import React from 'react';

const Table = ({ headers, data, renderRow }) => {
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '16px',
    fontFamily: 'var(--font-standard)',
  };

  const thStyle = {
    borderBottom: '2px solid var(--border-color)',
    padding: '12px',
    textAlign: 'left',
    fontWeight: 'bold',
  };

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} style={thStyle} className="handwritten">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
              {renderRow(item, idx)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
