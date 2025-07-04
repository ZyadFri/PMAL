import React, { useState, useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';

const Dashboard = () => {
  const { keycloak } = useKeycloak();
  const [activeNav, setActiveNav] = useState('dashboard');

  const handleLogout = () => {
    keycloak.logout();
  };

  // Add Font Awesome CSS to document head
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      margin: 0,
      padding: 0
    },
    sidebar: {
      width: '280px',
      background: 'linear-gradient(180deg, #1e3c72 0%, #2a5298 100%)',
      color: 'white',
      padding: 0,
      boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
      position: 'fixed',
      height: '100vh',
      overflowY: 'auto'
    },
    logo: {
      padding: '25px 20px',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      textAlign: 'center'
    },
    logoTitle: {
      fontSize: '28px',
      fontWeight: 700,
      color: '#FFD700',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
      margin: 0
    },
    logoSubtitle: {
      fontSize: '12px',
      color: 'rgba(255,255,255,0.8)',
      marginTop: '5px',
      margin: '5px 0 0 0'
    },
    userInfo: {
      padding: '20px',
      background: 'rgba(255,255,255,0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    avatar: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1e3c72'
    },
    userRole: {
      background: '#FFD700',
      color: '#1e3c72',
      padding: '3px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 600
    },
    navMenu: {
      padding: '20px 0'
    },
    navItem: {
      margin: '5px 20px',
      padding: '12px 15px',
      borderRadius: '10px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    navItemActive: {
      background: 'rgba(255,255,255,0.15)',
      transform: 'translateX(5px)'
    },
    navIcon: {
      width: '20px',
      textAlign: 'center'
    },
    mainContent: {
      marginLeft: '280px',
      flex: 1,
      padding: '30px'
    },
    header: {
      background: 'white',
      padding: '20px 30px',
      borderRadius: '15px',
      boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
      marginBottom: '30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerTitle: {
      color: '#1e3c72',
      fontSize: '28px',
      fontWeight: 600,
      margin: 0
    },
    headerSubtitle: {
      color: '#666',
      marginTop: '5px',
      margin: '5px 0 0 0'
    },
    headerActions: {
      display: 'flex',
      gap: '15px',
      alignItems: 'center'
    },
    btn: {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 600,
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px'
    },
    btnPrimary: {
      background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
      color: 'white'
    },
    btnSecondary: {
      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
      color: '#1e3c72'
    },
    btnSm: {
      padding: '8px 15px',
      fontSize: '12px',
      borderRadius: '6px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '25px',
      marginBottom: '30px'
    },
    statCard: {
      background: 'white',
      padding: '25px',
      borderRadius: '15px',
      boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
      transition: 'transform 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    },
    statCardBefore: {
      content: '',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(135deg, #1e3c72, #FFD700)'
    },
    statHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px'
    },
    statIcon: {
      width: '50px',
      height: '50px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      color: 'white'
    },
    statNumber: {
      fontSize: '32px',
      fontWeight: 700,
      color: '#1e3c72',
      marginBottom: '5px'
    },
    statLabel: {
      color: '#666',
      fontSize: '14px'
    },
    projectsSection: {
      background: 'white',
      padding: '30px',
      borderRadius: '15px',
      boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
      marginBottom: '30px'
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '25px'
    },
    sectionTitle: {
      fontSize: '24px',
      color: '#1e3c72',
      fontWeight: 600,
      margin: 0
    },
    projectsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '25px'
    },
    projectCard: {
      background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      padding: '25px',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    },
    projectHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '15px'
    },
    projectTitle: {
      fontSize: '18px',
      fontWeight: 600,
      color: '#1e3c72',
      marginBottom: '5px',
      margin: '0 0 5px 0'
    },
    projectPhase: {
      background: '#FFD700',
      color: '#1e3c72',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 600
    },
    projectStatus: {
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 600,
      marginBottom: '15px',
      display: 'inline-block'
    },
    statusNotScored: {
      background: '#fff3cd',
      color: '#856404'
    },
    statusInProgress: {
      background: '#d4edda',
      color: '#155724'
    },
    statusCompleted: {
      background: '#d1ecf1',
      color: '#0c5460'
    },
    projectActions: {
      display: 'flex',
      gap: '10px',
      marginTop: '15px'
    },
    assessmentProgress: {
      background: 'white',
      padding: '25px',
      borderRadius: '12px',
      marginTop: '20px',
      boxShadow: '0 5px 20px rgba(0,0,0,0.08)'
    },
    progressHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    progressBar: {
      background: '#f0f0f0',
      borderRadius: '10px',
      height: '8px',
      overflow: 'hidden'
    },
    progressFill: {
      background: 'linear-gradient(90deg, #1e3c72, #FFD700)',
      height: '100%',
      borderRadius: '10px',
      transition: 'width 0.3s ease'
    },
    quickActions: {
      background: 'white',
      padding: '30px',
      borderRadius: '15px',
      boxShadow: '0 5px 20px rgba(0,0,0,0.08)'
    },
    actionsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px'
    },
    actionCard: {
      background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
      color: 'white',
      padding: '25px',
      borderRadius: '12px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textDecoration: 'none'
    },
    actionCardSecondary: {
      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
      color: '#1e3c72'
    },
    actionIcon: {
      fontSize: '32px',
      marginBottom: '15px'
    },
    actionTitle: {
      fontSize: '16px',
      fontWeight: 600,
      marginBottom: '8px'
    },
    actionDesc: {
      fontSize: '12px',
      opacity: 0.8
    }
  };

  const navItems = [
    { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { id: 'projects', icon: 'fas fa-project-diagram', label: 'My Projects' },
    { id: 'assessments', icon: 'fas fa-chart-line', label: 'Assessments' },
    { id: 'history', icon: 'fas fa-history', label: 'Score History' },
    { id: 'reports', icon: 'fas fa-file-alt', label: 'Reports' },
    { id: 'team', icon: 'fas fa-users', label: 'Team Management' },
    { id: 'settings', icon: 'fas fa-cog', label: 'Settings' }
  ];

  const stats = [
    { number: '12', label: 'Total Projects', icon: 'fas fa-project-diagram', color: 'linear-gradient(135deg, #1e3c72, #2a5298)' },
    { number: '4', label: 'In Progress', icon: 'fas fa-clock', color: 'linear-gradient(135deg, #FFD700, #FFA500)' },
    { number: '8', label: 'Completed', icon: 'fas fa-check-circle', color: 'linear-gradient(135deg, #28a745, #20c997)' },
    { number: '4.2', label: 'Average Score', icon: 'fas fa-star', color: 'linear-gradient(135deg, #dc3545, #fd7e14)' }
  ];

  const projects = [
    {
      title: 'E-Commerce Platform',
      phase: 'Development',
      status: 'Assessment in Progress',
      statusType: 'in-progress',
      progress: 75,
      actions: ['Continue Assessment', 'View Details']
    },
    {
      title: 'Mobile Banking App',
      phase: 'Testing',
      status: 'Deep Assessment Complete',
      statusType: 'completed',
      score: '4.8/5.0',
      lastUpdated: '2 days ago',
      actions: ['Generate Report', 'View History']
    },
    {
      title: 'Data Analytics Dashboard',
      phase: 'Planning',
      status: 'Not Yet Scored',
      statusType: 'not-scored',
      created: '1 week ago',
      actions: ['Start Quick Assessment', 'Edit Project']
    }
  ];

  const quickActions = [
    { icon: 'fas fa-plus-circle', title: 'Create Project', desc: 'Start a new project assessment', type: 'primary' },
    { icon: 'fas fa-bolt', title: 'Quick Assessment', desc: 'Rapid project evaluation', type: 'secondary' },
    { icon: 'fas fa-chart-line', title: 'View Analytics', desc: 'Project performance insights', type: 'primary' },
    { icon: 'fas fa-file-download', title: 'Download Reports', desc: 'Export assessment reports', type: 'secondary' }
  ];

  const getStatusStyle = (statusType) => {
    switch (statusType) {
      case 'not-scored':
        return styles.statusNotScored;
      case 'in-progress':
        return styles.statusInProgress;
      case 'completed':
        return styles.statusCompleted;
      default:
        return styles.statusNotScored;
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <h1 style={styles.logoTitle}>PMAL</h1>
          <p style={styles.logoSubtitle}>Project Management Assessment Level</p>
        </div>
        
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {keycloak.tokenParsed?.given_name?.[0] || 'U'}{keycloak.tokenParsed?.family_name?.[0] || 'S'}
          </div>
          <div>
            <h3 style={{ fontSize: '16px', marginBottom: '5px', margin: 0 }}>
              {keycloak.tokenParsed?.name || keycloak.tokenParsed?.preferred_username || 'User'}
            </h3>
            <span style={styles.userRole}>Project Manager</span>
          </div>
        </div>
        
        <nav style={styles.navMenu}>
          {navItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              style={{
                ...styles.navItem,
                ...(activeNav === item.id ? styles.navItemActive : {})
              }}
              onMouseEnter={(e) => {
                if (activeNav !== item.id) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                  e.currentTarget.style.transform = 'translateX(5px)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeNav !== item.id) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              <i className={item.icon} style={styles.navIcon}></i>
              <span>{item.label}</span>
            </div>
          ))}
          
          <div
            onClick={handleLogout}
            style={{
              ...styles.navItem,
              marginTop: '20px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: '20px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.transform = 'translateX(5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <i className="fas fa-sign-out-alt" style={styles.navIcon}></i>
            <span>Logout</span>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>
              Welcome back, {keycloak.tokenParsed?.given_name || 'User'}!
            </h1>
            <p style={styles.headerSubtitle}>Here's what's happening with your projects today.</p>
          </div>
          <div style={styles.headerActions}>
            <button style={{...styles.btn, ...styles.btnSecondary}}>
              <i className="fas fa-plus"></i>
              New Project
            </button>
            <button style={{...styles.btn, ...styles.btnPrimary}}>
              <i className="fas fa-chart-bar"></i>
              Quick Assessment
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} style={styles.statCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={styles.statCardBefore}></div>
              <div style={styles.statHeader}>
                <div style={{...styles.statIcon, background: stat.color}}>
                  <i className={stat.icon}></i>
                </div>
              </div>
              <div style={styles.statNumber}>{stat.number}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Projects Section */}
        <div style={styles.projectsSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Recent Projects</h2>
            <button style={{...styles.btn, ...styles.btnPrimary, ...styles.btnSm}}>View All</button>
          </div>
          
          <div style={styles.projectsGrid}>
            {projects.map((project, index) => (
              <div key={index} style={styles.projectCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={styles.projectHeader}>
                  <div>
                    <h3 style={styles.projectTitle}>{project.title}</h3>
                    <span style={styles.projectPhase}>{project.phase}</span>
                  </div>
                </div>
                <div style={{...styles.projectStatus, ...getStatusStyle(project.statusType)}}>
                  {project.status}
                </div>
                
                {project.progress && (
                  <div style={styles.assessmentProgress}>
                    <div style={styles.progressHeader}>
                      <span style={{fontSize: '14px', fontWeight: 600, color: '#1e3c72'}}>Quick Assessment</span>
                      <span style={{fontSize: '12px', color: '#666'}}>{project.progress}% Complete</span>
                    </div>
                    <div style={styles.progressBar}>
                      <div style={{...styles.progressFill, width: `${project.progress}%`}}></div>
                    </div>
                  </div>
                )}
                
                {project.score && (
                  <div style={{margin: '15px 0'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                      <span style={{fontSize: '14px', color: '#666'}}>Final Score:</span>
                      <span style={{fontSize: '18px', fontWeight: 700, color: '#28a745'}}>{project.score}</span>
                    </div>
                    <div style={{fontSize: '12px', color: '#666'}}>Last updated: {project.lastUpdated}</div>
                  </div>
                )}
                
                {project.created && (
                  <div style={{margin: '15px 0'}}>
                    <div style={{fontSize: '14px', color: '#666', marginBottom: '10px'}}>Ready for assessment</div>
                    <div style={{fontSize: '12px', color: '#666'}}>Created: {project.created}</div>
                  </div>
                )}
                
                <div style={styles.projectActions}>
                  {project.actions.map((action, actionIndex) => (
                    <button 
                      key={actionIndex} 
                      style={{
                        ...styles.btn, 
                        ...styles.btnSm,
                        ...(actionIndex === 0 ? styles.btnPrimary : styles.btnSecondary)
                      }}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={styles.quickActions}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Quick Actions</h2>
          </div>
          
          <div style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <div
                key={index}
                style={{
                  ...styles.actionCard,
                  ...(action.type === 'secondary' ? styles.actionCardSecondary : {})
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = action.type === 'secondary' 
                    ? '0 10px 25px rgba(255, 215, 0, 0.3)' 
                    : '0 10px 25px rgba(30, 60, 114, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={styles.actionIcon}>
                  <i className={action.icon}></i>
                </div>
                <div style={styles.actionTitle}>{action.title}</div>
                <div style={styles.actionDesc}>{action.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;