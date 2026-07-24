import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Menu,
  Search,
  ChevronLeft,
  ChevronRight,
  Check,
  RotateCcw,
  X,
  RefreshCw,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  Clock,
  LogOut
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import { getOrders, getProducts, getCategories } from '../../utils/db';
import useSocket from '../../hooks/useSocket';

const KDS = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Core data states
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Active Filter states
  const [activeStage, setActiveStage] = useState('To Cook'); // 'All' | 'To Cook' | 'Preparing' | 'Completed'
  const [selectedProductFilter, setSelectedProductFilter] = useState(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Sidebar toggle state
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  // Local state for KDS Ticket status mapping (orderId -> stage & item checked states)
  // Saved in localStorage to persist KDS bump actions
  const [kdsStates, setKdsStates] = useState(() => {
    try {
      const saved = localStorage.getItem('kds_ticket_states');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Save ticket states to localStorage
  useEffect(() => {
    localStorage.setItem('kds_ticket_states', JSON.stringify(kdsStates));
  }, [kdsStates]);

  // Track updated ticket IDs for temporary highlight animation
  const [updatedTicketIds, setUpdatedTicketIds] = useState({});

  // Fetch orders from db
  const loadKDSData = async (isSilent = false) => {
    try {
      if (!isSilent && orders.length === 0) {
        setLoading(true);
      }
      const dbOrders = await getOrders().catch(() => []);

      let combined = [...dbOrders];

      // Sort by date (newest first) to maintain stable ticket positions
      combined.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

      // Detect changed/updated existing tickets for smooth highlight animation
      if (orders.length > 0) {
        const changedIds = [];
        combined.forEach(newOrder => {
          const oldOrder = orders.find(o => o.id === newOrder.id);
          if (oldOrder) {
            const oldContent = (oldOrder.kdsItems || oldOrder.items || '') + '|' + (oldOrder.status || '') + '|' + (oldOrder.amount || '');
            const newContent = (newOrder.kdsItems || newOrder.items || '') + '|' + (newOrder.status || '') + '|' + (newOrder.amount || '');
            if (oldContent !== newContent) {
              changedIds.push(newOrder.id);
            }
          }
        });

        if (changedIds.length > 0) {
          setUpdatedTicketIds(prev => {
            const next = { ...prev };
            changedIds.forEach(id => {
              next[id] = true;
            });
            return next;
          });

          // Soft highlight lasts for 900ms then clears
          setTimeout(() => {
            setUpdatedTicketIds(prev => {
              const next = { ...prev };
              changedIds.forEach(id => {
                delete next[id];
              });
              return next;
            });
          }, 900);
        }
      }

      setOrders(combined);

      // Initialize status for each order if not already in kdsStates
      setKdsStates(prev => {
        const next = { ...prev };
        combined.forEach(order => {
          if (!next[order.id]) {
            next[order.id] = {
              stage: 'To Cook',
              preparedItems: {}
            };
          }
        });
        return next;
      });

    } catch (err) {
      console.error("Failed to load KDS data", err);
    } finally {
      if (!isSilent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadKDSData(false);
    // Silent auto refresh every 5 seconds to keep data fresh without UI blinking
    const interval = setInterval(() => {
      loadKDSData(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Connect to KDS Websocket channel
  const wsUrl = useMemo(() => {
    const defaultBackendHost = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:8000'
      : window.location.origin;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || defaultBackendHost;

    try {
      const parsed = new URL(baseUrl);
      const scheme = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${scheme}//${parsed.host}/ws/kds/`;
    } catch {
      const scheme = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${scheme}//${window.location.host}/ws/kds/`;
    }
  }, []);

  const handleSocketMessage = useCallback((message) => {
    if (message.type === 'ORDER_CREATED' || message.type === 'ORDER_UPDATED' || message.type === 'ITEM_UPDATED') {
      loadKDSData(true);
    }
  }, []);

  const { status: socketStatus } = useSocket(wsUrl, handleSocketMessage);

  // Helper: map items to sidebar products/categories for filtering
  const getProductFilterKey = (itemName) => {
    const name = itemName.toLowerCase();
    if (name.includes('burger')) return 'Burger';
    if (name.includes('pizza')) return 'Pizza';
    if (name.includes('coffee') || name.includes('tea') || name.includes('lassi')) return 'coffee';
    if (name.includes('water')) return 'water';
    return null;
  };

  const getCategoryFilterKey = (itemName) => {
    const name = itemName.toLowerCase();
    if (name.includes('desert') || name.includes('cake') || name.includes('ice cream')) return 'Desert';
    if (name.includes('pizza') || name.includes('burger') || name.includes('bite') || name.includes('snack')) return 'Quick Bites';
    if (name.includes('tea') || name.includes('lassi') || name.includes('coffee') || name.includes('water') || name.includes('drink')) return 'Drink';
    return null;
  };

  // Parsing items string (e.g. "3 x Masala Tea, 3 x Lassi") into structured array
  const parseOrderItems = (orderId, itemsString) => {
    if (!itemsString) return [];
    const state = kdsStates[orderId];
    return itemsString.split(',').map((item, idx) => {
      const trimmed = item.trim();
      const match = trimmed.match(/^(\d+)\s*x\s*(.+)$/i);
      const quantity = match ? parseInt(match[1]) : 1;
      const name = match ? match[2].trim() : trimmed;
      const isPrepared = state?.preparedItems?.[idx] || false;
      return { quantity, name, prepared: isPrepared };
    });
  };

  const isCashier = user?.role === 'cashier';

  // Actions
  const handleToggleProductPrepared = (orderId, itemIndex, e) => {
    e.stopPropagation(); // Avoid triggering card bump
    if (isCashier) {
      alert("Cashiers have read-only access to KDS.");
      return;
    }
    setKdsStates(prev => {
      const ticketState = prev[orderId] || { stage: 'To Cook', preparedItems: {} };
      const preparedItems = { ...ticketState.preparedItems };
      preparedItems[itemIndex] = !preparedItems[itemIndex];
      return {
        ...prev,
        [orderId]: {
          ...ticketState,
          preparedItems
        }
      };
    });
  };

  const handleBumpCard = (orderId) => {
    if (isCashier) {
      alert("Cashiers have read-only access to KDS.");
      return;
    }
    setKdsStates(prev => {
      const ticketState = prev[orderId] || { stage: 'To Cook', preparedItems: {} };
      let nextStage = 'Preparing';
      if (ticketState.stage === 'To Cook') nextStage = 'Preparing';
      else if (ticketState.stage === 'Preparing') nextStage = 'Completed';
      else if (ticketState.stage === 'Completed') nextStage = 'Archived';

      return {
        ...prev,
        [orderId]: {
          ...ticketState,
          stage: nextStage
        }
      };
    });
    // Reset to page 1 if list changes
    setCurrentPage(1);
  };

  const handleResetTicket = (orderId, e) => {
    e.stopPropagation();
    if (isCashier) {
      alert("Cashiers have read-only access to KDS.");
      return;
    }
    setKdsStates(prev => ({
      ...prev,
      [orderId]: {
        stage: 'To Cook',
        preparedItems: {}
      }
    }));
  };

  const handleClearFilters = () => {
    setSelectedProductFilter(null);
    setSelectedCategoryFilter(null);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filter & Search computation
  const processedTickets = useMemo(() => {
    return orders.map(order => {
      const state = kdsStates[order.id] || { stage: 'To Cook', preparedItems: {} };
      const parsedItems = parseOrderItems(order.id, order.kdsItems || order.items);
      return {
        ...order,
        stage: state.stage,
        parsedItems
      };
    });
  }, [orders, kdsStates]);

  const filteredTickets = useMemo(() => {
    return processedTickets.filter(ticket => {
      // 1. Stage filter
      if (activeStage !== 'All' && ticket.stage !== activeStage) {
        return false;
      }
      // If Stage is All, hide archived ones
      if (activeStage === 'All' && ticket.stage === 'Archived') {
        return false;
      }

      // 2. Search query filter (Order ID, table, or items)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = ticket.id.toLowerCase().includes(query) || (ticket.displayId && ticket.displayId.toLowerCase().includes(query));
        const matchesTable = ticket.table.toLowerCase().includes(query);
        const matchesItems = (ticket.kdsItems || ticket.items || '').toLowerCase().includes(query);
        if (!matchesId && !matchesTable && !matchesItems) return false;
      }

      // 3. Product filter
      if (selectedProductFilter) {
        const hasProduct = ticket.parsedItems.some(item => getProductFilterKey(item.name) === selectedProductFilter);
        if (!hasProduct) return false;
      }

      // 4. Category filter
      if (selectedCategoryFilter) {
        const hasCategory = ticket.parsedItems.some(item => getCategoryFilterKey(item.name) === selectedCategoryFilter);
        if (!hasCategory) return false;
      }

      return true;
    });
  }, [processedTickets, activeStage, searchQuery, selectedProductFilter, selectedCategoryFilter]);

  // Stage counters for the tab headers
  const stageCounts = useMemo(() => {
    const counts = { All: 0, 'To Cook': 0, Preparing: 0, Completed: 0 };
    processedTickets.forEach(ticket => {
      if (ticket.stage !== 'Archived') {
        counts.All += 1;
        if (counts[ticket.stage] !== undefined) {
          counts[ticket.stage] += 1;
        }
      }
    });
    return counts;
  }, [processedTickets]);

  // Paginated tickets
  const totalTickets = filteredTickets.length;
  const totalPages = Math.ceil(totalTickets / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTickets = useMemo(() => {
    return filteredTickets.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTickets, startIndex]);

  // Pagination display range string (e.g. "1-3")
  const pageRangeString = useMemo(() => {
    if (totalTickets === 0) return '0-0';
    const end = Math.min(startIndex + itemsPerPage, totalTickets);
    return `${startIndex + 1}-${end}`;
  }, [startIndex, totalTickets]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-standard)',
      transition: 'background-color var(--transition-speed), color var(--transition-speed)',
      position: 'relative'
    }}>
      {/* Dynamic styles override to inject fonts and styling for handwriting, custom scrollbar and keyframes */}
      <style>{`
        .normalized-style {
          font-family: var(--font-standard);
          font-size: 16px;
          line-height: 1.5;
        }
        .kds-card {
          background: var(--bg-card);
          border: 1.5px solid var(--border-color);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          box-shadow: var(--card-shadow);
          cursor: pointer;
          position: relative;
          display: flex;
          flex-direction: column;
          min-height: 320px;
        }
        .kds-card:hover {
          transform: translateY(-5px);
          border-color: #9d4838;
          box-shadow: 0 15px 40px rgba(157, 72, 56, 0.2);
        }
        @keyframes subtleUpdatePulse {
          0% {
            border-color: #ea580c;
            box-shadow: 0 0 15px rgba(234, 88, 12, 0.45);
            background-color: rgba(234, 88, 12, 0.08);
          }
          50% {
            border-color: #f97316;
            box-shadow: 0 0 20px rgba(249, 115, 22, 0.55);
            background-color: rgba(249, 115, 22, 0.12);
          }
          100% {
            border-color: var(--border-color);
            box-shadow: var(--card-shadow);
            background-color: var(--bg-card);
          }
        }
        .kds-card.updated-highlight {
          animation: subtleUpdatePulse 0.9s cubic-bezier(0.25, 0.8, 0.25, 1);
          border-color: #ea580c !important;
        }
        .kds-card.preparing {
          border-left: 5px solid #d97706;
        }
        .kds-card.completed {
          border-left: 5px solid #10b981;
          opacity: 0.85;
        }
        .kds-header-icon {
          color: var(--text-secondary);
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          padding: 8px;
          border-radius: 50%;
          display: flex;
          alignItems: center;
          justifyContent: center;
        }
        .kds-header-icon:hover {
          color: var(--text-primary);
          background-color: var(--bg-button);
          transform: scale(1.1);
        }
        .kds-badge {
          background-color: var(--bg-button);
          color: var(--text-secondary);
          border-radius: 6px;
          padding: 2px 8px;
          font-size: 13px;
          font-weight: 700;
          margin-left: 8px;
          display: inline-block;
        }
        .kds-badge.active-badge {
          background-color: rgba(255, 255, 255, 0.2);
          color: var(--text-primary);
        }
        .strikethrough-item {
          text-decoration: line-through;
          opacity: 0.45;
          color: var(--text-secondary);
          transition: all 0.25s ease;
        }
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>

      {/* --- HEADER --- */}
      <header style={{
        height: '75px',
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 10,
        transition: 'background-color var(--transition-speed), border-color var(--transition-speed)'
      }}>
        {/* Left: Logo & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            onClick={() => navigate('/kds')}
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <img src="/logo.png" alt="Byte & Brew" style={{ height: '50px', objectFit: 'contain' }} />
          </div>
          <span style={{
            fontSize: '22px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            letterSpacing: '0.5px'
          }}>
            KDS
          </span>
          {/* WebSocket Connection Status Indicator */}
          <div
            title={`WebSocket Connection Status: ${socketStatus}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600',
              backgroundColor:
                socketStatus === 'Connected' ? 'rgba(16, 185, 129, 0.15)' :
                socketStatus === 'Connecting' ? 'rgba(245, 158, 11, 0.15)' :
                socketStatus === 'Reconnecting' ? 'rgba(234, 88, 12, 0.15)' :
                'rgba(239, 68, 68, 0.15)',
              color:
                socketStatus === 'Connected' ? '#10b981' :
                socketStatus === 'Connecting' ? '#f59e0b' :
                socketStatus === 'Reconnecting' ? '#ea580c' :
                '#ef4444',
              border: `1px solid ${
                socketStatus === 'Connected' ? 'rgba(16, 185, 129, 0.3)' :
                socketStatus === 'Connecting' ? 'rgba(245, 158, 11, 0.3)' :
                socketStatus === 'Reconnecting' ? 'rgba(234, 88, 12, 0.3)' :
                'rgba(239, 68, 68, 0.3)'
              }`,
              transition: 'all 0.3s ease'
            }}
          >
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor:
                socketStatus === 'Connected' ? '#10b981' :
                socketStatus === 'Connecting' ? '#f59e0b' :
                socketStatus === 'Reconnecting' ? '#ea580c' :
                '#ef4444',
              display: 'inline-block'
            }} />
            {socketStatus === 'Reconnecting' ? 'Reconnecting...' : socketStatus === 'Connecting' ? 'Connecting...' : socketStatus}
          </div>
        </div>

        {/* Center: Theme Toggle Button */}


        {/* Right: User profile info & Hamburger Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              className="kds-header-icon"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              onClick={toggleTheme}
              style={{
                padding: '10px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-button)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)'
              }}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-button)',
            border: '1.5px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-link)',
            transition: 'all var(--transition-speed)'
          }}>
            <User size={20} />
          </div>
          <button
            className="kds-header-icon"
            style={{ padding: '6px' }}
            onClick={() => setIsRightSidebarOpen(true)}
            title="Open Control Panel"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* --- TAB FILTER & SEARCH BAR --- */}
      <div style={{
        backgroundColor: 'var(--input-bg)',
        borderBottom: '1px solid var(--border-color)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        transition: 'background-color var(--transition-speed), border-color var(--transition-speed)'
      }}>
        {/* Left: Tab selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button className="kds-header-icon" style={{ padding: '6px' }}>
            <Menu size={20} />
          </button>

          {/* All tab */}
          <button
            onClick={() => { setActiveStage('All'); setCurrentPage(1); }}
            style={{
              backgroundColor: activeStage === 'All' ? 'var(--bg-button)' : 'transparent',
              color: 'var(--text-primary)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
          >
            All <span className="kds-badge active-badge">{stageCounts.All}</span>
          </button>

          <span style={{ color: 'var(--border-color)', fontWeight: 'bold' }}>|</span>

          {/* To Cook tab */}
          <button
            onClick={() => { setActiveStage('To Cook'); setCurrentPage(1); }}
            style={{
              backgroundColor: activeStage === 'To Cook' ? '#ab4b38' : 'transparent',
              color: activeStage === 'To Cook' ? '#ffffff' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
          >
            To Cook <span className={`kds-badge ${activeStage === 'To Cook' ? 'active-badge' : ''}`} style={{
              backgroundColor: activeStage === 'To Cook' ? 'rgba(255,255,255,0.25)' : 'var(--bg-button)',
              color: activeStage === 'To Cook' ? '#ffffff' : 'var(--text-secondary)'
            }}>{stageCounts['To Cook']}</span>
          </button>

          {/* Preparing tab */}
          <button
            onClick={() => { setActiveStage('Preparing'); setCurrentPage(1); }}
            style={{
              backgroundColor: activeStage === 'Preparing' ? '#d97706' : 'transparent',
              color: activeStage === 'Preparing' ? '#ffffff' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
          >
            Preparing <span className={`kds-badge ${activeStage === 'Preparing' ? 'active-badge' : ''}`} style={{
              backgroundColor: activeStage === 'Preparing' ? 'rgba(255,255,255,0.25)' : 'var(--bg-button)',
              color: activeStage === 'Preparing' ? '#ffffff' : 'var(--text-secondary)'
            }}>{stageCounts.Preparing}</span>
          </button>

          {/* Completed tab */}
          <button
            onClick={() => { setActiveStage('Completed'); setCurrentPage(1); }}
            style={{
              backgroundColor: activeStage === 'Completed' ? '#854d0e' : 'transparent',
              color: activeStage === 'Completed' ? '#ffffff' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
          >
            Completed <span className={`kds-badge ${activeStage === 'Completed' ? 'active-badge' : ''}`} style={{
              backgroundColor: activeStage === 'Completed' ? 'rgba(255,255,255,0.25)' : 'var(--bg-button)',
              color: activeStage === 'Completed' ? '#ffffff' : 'var(--text-secondary)'
            }}>{stageCounts.Completed}</span>
          </button>
        </div>

        {/* Right: Search & Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', width: '240px' }}>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 12px 8px 36px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-secondary)' }} />
            {/* Tiny collaborator bubble matching "Acrobatic Monkey" tag from screenshot */}

          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', userSelect: 'none' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}>
              {pageRangeString} of {totalTickets}
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                style={{
                  backgroundColor: 'var(--bg-button)',
                  color: currentPage === 1 ? 'var(--border-color)' : 'var(--text-primary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                style={{
                  backgroundColor: 'var(--bg-button)',
                  color: currentPage >= totalPages ? 'var(--border-color)' : 'var(--text-primary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px',
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN LAYOUT (Sidebar Filters & Ticket Cards Grid) --- */}
      <div style={{ display: 'flex', flex: 1 }}>

        {/* --- LEFT SIDEBAR FILTERS --- */}
        <aside style={{
          width: '240px',
          backgroundColor: 'var(--input-bg)',
          borderRight: '1px solid var(--border-color)',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
          userSelect: 'none',
          transition: 'background-color var(--transition-speed), border-color var(--transition-speed)'
        }}>
          {/* Clear Filter Button */}
          {(selectedProductFilter || selectedCategoryFilter || searchQuery) ? (
            <button
              onClick={handleClearFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                backgroundColor: 'rgba(234, 88, 12, 0.1)',
                color: '#ea580c',
                border: '1px solid rgba(234, 88, 12, 0.2)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Clear Filter <X size={16} />
            </button>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              color: 'var(--text-secondary)',
              padding: '10px 14px',
              fontSize: '14px',
              fontWeight: '700',
              border: '1px solid transparent',
            }}>
              Clear Filter <X size={16} />
            </div>
          )}

          {/* Products Filter Section */}
          <div>
            <h4 style={{
              color: '#ab4b38',
              fontSize: '15px',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '12px',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '6px'
            }}>
              Product
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Burger', 'Pizza', 'coffee', 'water'].map((product) => {
                const isActive = selectedProductFilter === product;
                return (
                  <button
                    key={product}
                    onClick={() => {
                      setSelectedProductFilter(isActive ? null : product);
                      setCurrentPage(1);
                    }}
                    style={{
                      textAlign: 'left',
                      backgroundColor: isActive ? '#ab4b38' : 'transparent',
                      color: isActive ? '#ffffff' : 'var(--text-link)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {product}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categories Filter Section */}
          <div>
            <h4 style={{
              color: '#ab4b38',
              fontSize: '15px',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '12px',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '6px'
            }}>
              Category
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Desert', 'Quick Bites', 'Drink'].map((category) => {
                const isActive = selectedCategoryFilter === category;
                return (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategoryFilter(isActive ? null : category);
                      setCurrentPage(1);
                    }}
                    style={{
                      textAlign: 'left',
                      backgroundColor: isActive ? '#ab4b38' : 'transparent',
                      color: isActive ? '#ffffff' : 'var(--text-link)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* --- MAIN KITCHEN TICKETS GRID --- */}
        <main style={{
          flex: 1,
          padding: '32px',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-primary)',
          transition: 'background-color var(--transition-speed)'
        }}>
          {loading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '300px',
              color: 'var(--text-secondary)',
              gap: '16px'
            }}>
              <RefreshCw className="animate-spin" size={36} />
              <span>Loading kitchen orders...</span>
            </div>
          ) : paginatedTickets.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '350px',
              color: 'var(--text-secondary)',
              gap: '16px',
              border: '2px dashed var(--border-color)',
              borderRadius: '20px',
              padding: '40px',
              backgroundColor: 'var(--input-bg)'
            }}>
              <Sparkles size={48} color="#ab4b38" />
              <h3 style={{ fontSize: '20px', color: 'var(--text-primary)', margin: 0 }}>All Clean! No active orders.</h3>
              <p style={{ fontSize: '14px', maxWidth: '300px', textAlign: 'center' }}>
                Orders placed from the POS app will automatically stream here. Try selecting another tab or clear your filters.
              </p>
              <button
                onClick={loadKDSData}
                style={{
                  backgroundColor: 'var(--bg-button)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  marginTop: '12px'
                }}
              >
                Reload Tickets
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px'
            }}>
              {paginatedTickets.map((ticket) => {
                const allPrepared = ticket.parsedItems.every(item => item.prepared);
                const isUpdated = !!updatedTicketIds[ticket.id];

                return (
                  <div
                    key={ticket.id}
                    className={`kds-card ${ticket.stage === 'Preparing' ? 'preparing' : ''} ${ticket.stage === 'Completed' ? 'completed' : ''} ${isUpdated ? 'updated-highlight' : ''}`}
                    onClick={() => handleBumpCard(ticket.id)}
                  >


                    {/* Card Header */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px dashed var(--border-color)',
                      paddingBottom: '14px',
                      marginBottom: '16px'
                    }}>
                      <h3 style={{
                        fontSize: '32px',
                        fontWeight: '800',
                        color: 'var(--text-primary)',
                        margin: 0,
                        fontFamily: 'var(--font-standard)'
                      }}>
                        #{ticket.displayId || ticket.id}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: '700',
                          backgroundColor: 'var(--bg-button)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          color: 'var(--text-secondary)'
                        }}>
                          {ticket.table}
                        </span>

                        {!isCashier && (
                          <button
                            onClick={(e) => handleResetTicket(ticket.id, e)}
                            title="Reset Ticket State"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '4px'
                            }}
                          >
                            <RotateCcw size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Card Items List (Normalized standard font style) */}
                    <div className="normalized-style" style={{ flex: 1, padding: '4px 0' }}>
                      {ticket.parsedItems.map((item, idx) => {
                        const isRemoved = item.name.toLowerCase().includes('(removed)');
                        return (
                          <div
                            key={idx}
                            onClick={(e) => !isRemoved && handleToggleProductPrepared(ticket.id, idx, e)}
                            className={item.prepared ? 'strikethrough-item' : ''}
                            style={{
                              padding: '6px 0',
                              borderBottom: '1px solid rgba(160, 149, 138, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: (isRemoved || isCashier) ? 'default' : 'pointer',
                              userSelect: 'none',
                              color: isRemoved ? '#ef4444' : 'inherit',
                              textDecoration: isRemoved ? 'line-through' : (item.prepared ? 'line-through' : 'none'),
                              opacity: isRemoved ? 0.7 : (item.prepared ? 0.45 : 1)
                            }}
                          >
                            <span>
                              {item.quantity} &times; {item.name}
                            </span>

                            {item.prepared && !isRemoved && (
                              <Check size={14} color="#10b981" style={{ marginLeft: '8px' }} />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Card Footer Bump Action Button */}
                    <div style={{
                      marginTop: '20px',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        fontWeight: '700'
                      }}>
                        {ticket.stage === 'To Cook' ? '🔥 TO COOK' : ticket.stage === 'Preparing' ? '👩‍🍳 PREPARING' : '✅ COMPLETED'}
                      </span>

                      <button
                        disabled={isCashier}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBumpCard(ticket.id);
                        }}
                        style={{
                          backgroundColor: isCashier ? '#6b7280' : (ticket.stage === 'To Cook' ? '#ab4b38' : ticket.stage === 'Preparing' ? '#d97706' : '#10b981'),
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: '800',
                          cursor: isCashier ? 'not-allowed' : 'pointer',
                          opacity: isCashier ? 0.65 : 1
                        }}
                      >
                        {isCashier ? 'Read-Only' : (ticket.stage === 'To Cook' ? 'Start Preparing' : ticket.stage === 'Preparing' ? 'Complete' : 'Archive')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* --- FOOTER INSTRUCTIONS MATCHING THE SPECIFICATIONS --- */}
      <footer style={{
        backgroundColor: 'var(--input-bg)',
        borderTop: '1px solid var(--border-color)',
        padding: '16px 24px',
        fontSize: '13px',
        color: 'var(--text-secondary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        transition: 'background-color var(--transition-speed), border-color var(--transition-speed)'
      }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <span>💡 <strong>Click card:</strong> Advance ticket stage</span>
          <span>✏️ <strong>Click item:</strong> Strikethrough (prepared)</span>
          <span>🏷️ <strong>Ticket #:</strong> Same as Order #</span>
        </div>
        <div>
          <span>🔗 Fixed URL: <code>localhost:5174/kds</code></span>
        </div>
      </footer>

      {/* --- RIGHT SLIDE-IN SIDEBAR CONTROL PANEL --- */}
      {isRightSidebarOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 100,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'flex-end',
          backdropFilter: 'blur(4px)',
          transition: 'all 0.3s ease-in-out'
        }}
          onClick={() => setIsRightSidebarOpen(false)}
        >
          <div style={{
            width: '300px',
            height: '100%',
            backgroundColor: 'var(--bg-card)',
            borderLeft: '1px solid var(--border-color)',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.3)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            animation: 'slideInRight 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
          }}
            onClick={(e) => e.stopPropagation()} // Prevent close on body clicks
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>Control Panel</h3>
              <button
                onClick={() => setIsRightSidebarOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Detail */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'var(--bg-primary)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              transition: 'background-color var(--transition-speed)'
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-button)',
                border: '1.5px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                fontWeight: 'bold',
                fontSize: '18px'
              }}>
                C
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)' }}>
                  {user?.name || 'Chef'}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {user?.email || 'chef@cafe.com'}
                </span>
              </div>
            </div>

            {/* Quick Links Menu */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <button
                onClick={() => {
                  setIsRightSidebarOpen(false);
                  navigate('/pos');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--text-link)',
                  fontSize: '16px',
                  fontWeight: '600',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-button)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-link)';
                }}
              >
                <Monitor size={18} /> POS Register
              </button>

              <button
                onClick={() => {
                  setIsRightSidebarOpen(false);
                  navigate('/orders');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--text-link)',
                  fontSize: '16px',
                  fontWeight: '600',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-button)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-link)';
                }}
              >
                <Clock size={18} /> Order History
              </button>
            </div>

            {/* Logout Action button */}
            <button
              onClick={() => {
                setIsRightSidebarOpen(false);
                handleLogout();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                width: '100%',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#b91c1c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
              }}
            >
              <LogOut size={18} /> Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KDS;
