export const bodyOrdersStyle = {
  padding: '30px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  height: 'calc(100vh - 70px)',
  overflowY: 'auto',
  backgroundColor: 'var(--bg-primary)',
  color: 'var(--text-primary)',
};

export const thStyle = {
  padding: '16px 20px',
  textAlign: 'left',
  color: 'var(--text-secondary)',
  fontWeight: '700',
  borderBottom: '2px solid var(--border-color)',
  fontSize: '13px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

export const tdStyle = {
  padding: '16px 20px',
  borderBottom: '1.5px solid var(--border-color)',
  color: 'var(--text-primary)',
  fontSize: '14.5px',
  verticalAlign: 'middle',
  textAlign: 'left'
};

export const iconBtnStyle = {
  backgroundColor: 'var(--bg-button)',
  border: 'none',
  color: 'var(--text-primary)',
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background-color var(--transition-speed), color var(--transition-speed)',
};
