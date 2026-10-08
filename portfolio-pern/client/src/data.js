export const experience = [
  { icon: 'code', title: 'Software Engineer Intern, SHNOOR International LLC', when: 'Jul 2026 to Aug 2026', points: [
    'Supported backend development and API integrations for web and software applications.',
    'Worked on database management and optimisation to improve performance and user experience.',
    'Debugged, tested and troubleshot software, writing clean and well-documented code.',
    'Collaborated with cross-functional teams to turn requirements into working solutions.'] },
  { icon: 'chip', title: 'Virtual Internship 6.0, Infosys Springboard', when: 'Dec 2025 to Feb 2026', points: [
    'Built and deployed a CNN/MobileNet image classifier reaching 96% validation accuracy, with a Streamlit interface for real-time predictions.'] },
];
export const projects = [
  { wide: true, icon: 'user', grad: 'var(--b),var(--c)', title: 'AI-Based HRMS Platform', when: '2026',
    blurb: 'An employee and admin platform covering employees, tasks, documents, calendar and leave, backed by a normalised PostgreSQL schema.',
    points: ['JWT authentication with role-based access control for Admin and Employee roles, plus Google OAuth login.',
      'Real-time one-to-one and group chat with Socket.IO, and a live dashboard aggregating data across tables.',
      'All REST endpoints tested in Postman; deployed on Render after resolving SPA routing and environment variable timing issues.'],
    tags: ['PostgreSQL', 'Express', 'React', 'Node.js', 'Socket.IO', 'JWT', 'Render'] },
  { icon: 'chat', grad: 'var(--a),var(--b)', title: 'Issue Redressal System', when: 'May 2024',
    blurb: 'Ticket-based complaint management with REST APIs for registration, assignment and status tracking. Optimised MySQL queries speed up data retrieval and enable real-time issue tracking.',
    tags: ['MySQL', 'REST APIs', 'Full-stack'] },
  { icon: 'wave', grad: 'var(--c),var(--d)', title: 'Deepfake Audio Detection', when: 'Jan 2025',
    blurb: 'A machine learning model that detects manipulated audio using speech feature extraction, preprocessing and dataset cleaning.',
    tags: ['Python', 'Machine learning', 'Audio features'] },
];
export const skills = [
  { icon: 'code', title: 'Languages', items: ['Java', 'JavaScript', 'Python'] },
  { icon: 'eye', title: 'ML and computer vision', items: ['YOLOv8', 'OpenCV', 'CNN/MobileNet', 'Streamlit', 'gTTS'] },
  { icon: 'srv', title: 'Frontend and backend', items: ['React', 'Node.js', 'Express.js', 'REST APIs', 'Socket.IO'] },
  { icon: 'db', title: 'Databases', items: ['PostgreSQL', 'MySQL', 'SQL', 'Query optimisation'] },
  { icon: 'cloud', title: 'Cloud and tools', items: ['Render', 'Postman', 'Git and GitHub', 'Agile Scrum'] },
  { icon: 'spark', title: 'Core CS', items: ['Data structures and algorithms', 'OOP', '150+ LeetCode problems'] },
];
export const certs = [
  ['Database Programming with SQL', 'Oracle Academy, Nov 2024'],
  ['Agile Scrum in Practice', 'Infosys Springboard, Jun 2025'],
  ['Frontend with HTML5 and CSS3', 'TASK, Aug 2024'],
  ['TCS iON Communication Skills', 'Jan 2026'],
];
