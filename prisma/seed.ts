import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { saveSamplePdfToDisk } from '../src/lib/pdfGenerator';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting academic knowledge repository seed...');

  // 1. Create Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const contribPassword = await bcrypt.hash('contrib123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@campus.edu' },
    update: {},
    create: {
      email: 'admin@campus.edu',
      name: 'System Dean / Administrator',
      passwordHash: adminPassword,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  const contributor = await prisma.user.upsert({
    where: { email: 'contributor@campus.edu' },
    update: {},
    create: {
      email: 'contributor@campus.edu',
      name: 'Arjun Verma (TA / Contributor)',
      passwordHash: contribPassword,
      role: 'CONTRIBUTOR',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@campus.edu' },
    update: {},
    create: {
      email: 'student@campus.edu',
      name: 'Rohan Sharma (Junior CS Student)',
      passwordHash: studentPassword,
      role: 'STUDENT',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  console.log('✓ Users seeded (admin, contributor, student)');

  // 2. Create Departments
  const deptCSE = await prisma.department.upsert({
    where: { code: 'CSE' },
    update: {},
    create: {
      code: 'CSE',
      name: 'Computer Science & Engineering',
      description: 'Computing systems, algorithms, database architectures, and distributed systems.',
      icon: 'Laptop',
    },
  });

  const deptECE = await prisma.department.upsert({
    where: { code: 'ECE' },
    update: {},
    create: {
      code: 'ECE',
      name: 'Electronics & Communication Engineering',
      description: 'Signal processing, microprocessors, embedded systems, and VLSI design.',
      icon: 'Cpu',
    },
  });

  const deptEEE = await prisma.department.upsert({
    where: { code: 'EEE' },
    update: {},
    create: {
      code: 'EEE',
      name: 'Electrical & Electronics Engineering',
      description: 'Power electronics, control systems, and renewable energy grids.',
      icon: 'Zap',
    },
  });

  const deptME = await prisma.department.upsert({
    where: { code: 'ME' },
    update: {},
    create: {
      code: 'ME',
      name: 'Mechanical Engineering',
      description: 'Thermodynamics, fluid mechanics, robotics, and manufacturing.',
      icon: 'Cog',
    },
  });

  console.log('✓ Departments seeded');

  // 3. Create Semesters 1 to 8
  const semesters: Record<number, string> = {};
  for (let i = 1; i <= 8; i++) {
    const sem = await prisma.semester.upsert({
      where: { number: i },
      update: {},
      create: {
        number: i,
        label: `Semester ${i}`,
      },
    });
    semesters[i] = sem.id;
  }
  console.log('✓ Semesters 1-8 seeded');

  // 4. Create Academic Years
  const year2526 = await prisma.academicYear.upsert({
    where: { label: '2025-26' },
    update: {},
    create: { label: '2025-26', isCurrent: true },
  });

  const year2425 = await prisma.academicYear.upsert({
    where: { label: '2024-25' },
    update: {},
    create: { label: '2024-25', isCurrent: false },
  });

  const year2324 = await prisma.academicYear.upsert({
    where: { label: '2023-24' },
    update: {},
    create: { label: '2023-24', isCurrent: false },
  });

  console.log('✓ Academic years seeded');

  // 5. Create Teachers
  const teacherRavi = await prisma.teacher.upsert({
    where: { id: 'prof-ravi-kumar' },
    update: {},
    create: {
      id: 'prof-ravi-kumar',
      name: 'Dr. Ravi Kumar',
      title: 'Associate Professor',
      email: 'ravi.kumar@campus.edu',
      departmentId: deptCSE.id,
      cabin: 'CSE Block 3, Room 304',
      bio: 'Ph.D. in Distributed Data Systems. Research interests include query optimization, transactional storage engines, and ACID consistency in cloud architectures.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
  });

  const teacherAnil = await prisma.teacher.upsert({
    where: { id: 'prof-anil-sharma' },
    update: {},
    create: {
      id: 'prof-anil-sharma',
      name: 'Dr. Anil Sharma',
      title: 'Professor & Head of Department',
      email: 'anil.sharma@campus.edu',
      departmentId: deptCSE.id,
      cabin: 'CSE Block 1, Room 101',
      bio: 'Specialist in Database Systems and Formal Relational Foundations. 20+ years teaching relational databases, query planning, and data structures.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    },
  });

  const teacherRajesh = await prisma.teacher.upsert({
    where: { id: 'prof-rajesh-menon' },
    update: {},
    create: {
      id: 'prof-rajesh-menon',
      name: 'Dr. Rajesh Menon',
      title: 'Professor',
      email: 'rajesh.menon@campus.edu',
      departmentId: deptCSE.id,
      cabin: 'CSE Block 2, Room 402',
      bio: 'Operating systems kernel specialist. Teaches low-level concurrency, virtual memory architectures, and POSIX thread scheduling.',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    },
  });

  const teacherSunita = await prisma.teacher.upsert({
    where: { id: 'prof-sunita-rao' },
    update: {},
    create: {
      id: 'prof-sunita-rao',
      name: 'Prof. Sunita Rao',
      title: 'Assistant Professor',
      email: 'sunita.rao@campus.edu',
      departmentId: deptCSE.id,
      cabin: 'CSE Block 3, Room 215',
      bio: 'Expert in Computer Networks, Wireless Sensor Networks, and TCP congestion avoidance mechanisms.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
  });

  const teacherPriya = await prisma.teacher.upsert({
    where: { id: 'prof-priya-nair' },
    update: {},
    create: {
      id: 'prof-priya-nair',
      name: 'Prof. Priya Nair',
      title: 'Assistant Professor',
      email: 'priya.nair@campus.edu',
      departmentId: deptCSE.id,
      cabin: 'CSE Block 2, Room 208',
      bio: 'Teaches Computer Organization, RISC-V pipelining, and cache coherence protocols.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    },
  });

  console.log('✓ Faculty teachers seeded');

  // 6. Create Subjects
  const dbmsUnits = JSON.stringify([
    {
      unitNumber: 1,
      title: 'Introduction to DBMS & Relational Architecture',
      description: 'Data models, three-schema architecture, data independence, DBMS vs file systems.',
      topics: ['Three Schema Architecture', 'Data Models', 'DBMS Storage Structures', 'Database Languages (DDL, DML)'],
    },
    {
      unitNumber: 2,
      title: 'Entity-Relationship (ER) Modeling',
      description: 'Entities, attributes, relationships, cardinality ratios, Enhanced ER diagrams and relational synthesis.',
      topics: ['ER Diagrams', 'Specialization & Generalization', 'Mapping ER to Relational Tables', 'Integrity Constraints'],
    },
    {
      unitNumber: 3,
      title: 'Relational Model & Normalization',
      description: 'Relational algebra, tuple calculus, functional dependencies, 1NF, 2NF, 3NF, BCNF, and 4NF decomposition.',
      topics: ['Relational Algebra Operators', 'Functional Dependencies', 'Armstrong Axioms', 'Lossless Join & Dependency Preservation'],
    },
    {
      unitNumber: 4,
      title: 'SQL, Indexing & Storage Engine',
      description: 'Complex SQL queries, subqueries, joins, aggregation, B+ Tree index structures, hashing techniques.',
      topics: ['Complex SQL Queries', 'Group By & Having', 'Triggers & Stored Procedures', 'B+ Tree Indexing'],
    },
    {
      unitNumber: 5,
      title: 'Transactions & Concurrency Control',
      description: 'ACID properties, serializability, two-phase locking (2PL), deadlock prevention, recovery algorithms (ARIES).',
      topics: ['ACID Properties', 'Conflict & View Serializability', '2PL & Strict 2PL', 'WAL & Checkpointing'],
    },
  ]);

  const subjectDBMS = await prisma.subject.upsert({
    where: { code: 'CS501' },
    update: {},
    create: {
      code: 'CS501',
      name: 'Database Management Systems',
      departmentId: deptCSE.id,
      semesterId: semesters[5],
      credits: 4,
      coordinator: 'Dr. Ravi Kumar',
      description: 'Fundamental principles of relational database management, data modeling, query languages, index architectures, and transactional consistency.',
      fullSyllabus: 'Comprehensive 5-unit syllabus covering relational theory, ER diagrams, normalization, SQL, indexing, and ACID concurrency control.',
      syllabusUnits: dbmsUnits,
    },
  });

  const osUnits = JSON.stringify([
    {
      unitNumber: 1,
      title: 'Operating System Architectures & Kernel Primitives',
      description: 'Dual mode operations, trap handlers, system calls, OS structures.',
      topics: ['System Calls', 'Kernel vs User Mode', 'Monolithic vs Microkernel'],
    },
    {
      unitNumber: 2,
      title: 'Process Management & CPU Scheduling',
      description: 'Process control blocks, context switching, scheduling criteria (FCFS, SJF, Round Robin, Multilevel).',
      topics: ['Process States', 'Context Switching', 'Round Robin & Priority Scheduling', 'Thread Models'],
    },
    {
      unitNumber: 3,
      title: 'Process Synchronization & Deadlocks',
      description: 'Race conditions, Peterson algorithm, semaphores, monitors, classic problems (Dining Philosophers), Bankers Algorithm.',
      topics: ['Critical Section', 'Counting Semaphores', 'Deadlock Detection & Prevention', 'Bankers Algorithm'],
    },
    {
      unitNumber: 4,
      title: 'Memory Management & Virtual Memory',
      description: 'Contiguous allocation, paging, TLB translation, segmentation, page faults, FIFO, LRU, Optimal page replacement.',
      topics: ['Multi-level Paging', 'Inverted Page Tables', 'LRU Page Replacement', 'Thrashing & Working Set'],
    },
    {
      unitNumber: 5,
      title: 'File Systems & Storage Systems',
      description: 'Directory structures, inode representation, disk scheduling (SCAN, C-SCAN, LOOK), RAID architectures.',
      topics: ['Unix Inodes', 'Disk Scheduling Algorithms', 'RAID Levels 0-5', 'File Allocation Methods'],
    },
  ]);

  const subjectOS = await prisma.subject.upsert({
    where: { code: 'CS502' },
    update: {},
    create: {
      code: 'CS502',
      name: 'Operating Systems',
      departmentId: deptCSE.id,
      semesterId: semesters[5],
      credits: 4,
      coordinator: 'Dr. Rajesh Menon',
      description: 'Core concepts of process isolation, multithreading, concurrency primitives, virtual memory management, and file systems.',
      fullSyllabus: 'Detailed study of kernel design, process synchronization, CPU scheduling algorithms, virtual memory paging, and disk storage architectures.',
      syllabusUnits: osUnits,
    },
  });

  const cnUnits = JSON.stringify([
    {
      unitNumber: 1,
      title: 'Physical & Data Link Layers',
      description: 'Layered network models (OSI and TCP/IP), framing, error control (CRC), flow control (Sliding Window).',
      topics: ['OSI 7-Layer Model', 'CRC Computation', 'Go-Back-N & Selective Repeat', 'Ethernet Standards'],
    },
    {
      unitNumber: 2,
      title: 'Network Layer & IP Addressing',
      description: 'IPv4 packet structure, CIDR subnetting, NAT, IPv6 transition, routing protocols (Dijkstra Link State, Distance Vector).',
      topics: ['IPv4 vs IPv6', 'Subnetting & Supernetting', 'OSPF & RIP Algorithms', 'BGP Exterior Routing'],
    },
    {
      unitNumber: 3,
      title: 'Transport Protocols (TCP / UDP)',
      description: 'Three-way handshake, reliable byte stream, TCP congestion control (AIMD, slow start, fast retransmit), UDP datagrams.',
      topics: ['TCP 3-Way Handshake', 'Congestion Window Management', 'Fast Recovery', 'UDP Header Structure'],
    },
    {
      unitNumber: 4,
      title: 'Application Layer Services',
      description: 'DNS hierarchy, HTTP 1.1/2/3, SMTP, IMAP, socket programming and peer-to-peer systems.',
      topics: ['DNS Resolution', 'HTTP/2 Multiplexing', 'Email Delivery Protocols', 'Web Sockets'],
    },
    {
      unitNumber: 5,
      title: 'Network Security Principles',
      description: 'Symmetric & asymmetric encryption (RSA), SSL/TLS handshake, firewalls, and packet filtering.',
      topics: ['RSA Cryptosystem', 'TLS Handshake', 'Packet Filtering Firewalls', 'IPsec Architecture'],
    },
  ]);

  const subjectCN = await prisma.subject.upsert({
    where: { code: 'CS503' },
    update: {},
    create: {
      code: 'CS503',
      name: 'Computer Networks',
      departmentId: deptCSE.id,
      semesterId: semesters[5],
      credits: 3,
      coordinator: 'Prof. Sunita Rao',
      description: 'Protocol architecture across the TCP/IP stack from physical framing to network routing, reliable transport, and secure application protocols.',
      fullSyllabus: 'In-depth protocol study of OSI/TCP-IP models, packet switching, routing algorithms, transport-layer flow control, and network security.',
      syllabusUnits: cnUnits,
    },
  });

  const subjectDSA = await prisma.subject.upsert({
    where: { code: 'CS301' },
    update: {},
    create: {
      code: 'CS301',
      name: 'Data Structures & Algorithms',
      departmentId: deptCSE.id,
      semesterId: semesters[3],
      credits: 4,
      coordinator: 'Dr. Anil Sharma',
      description: 'Linear and non-linear data structures, asymptotic time complexity analysis, AVL trees, graphs, and dynamic programming.',
      fullSyllabus: 'Arrays, linked lists, stacks, queues, binary search trees, AVL trees, B-Trees, graph traversal, and sorting algorithms.',
    },
  });

  const subjectCOA = await prisma.subject.upsert({
    where: { code: 'CS401' },
    update: {},
    create: {
      code: 'CS401',
      name: 'Computer Organization & Architecture',
      departmentId: deptCSE.id,
      semesterId: semesters[4],
      credits: 4,
      coordinator: 'Prof. Priya Nair',
      description: 'Instruction set architectures, ALU design, floating-point arithmetic, processor pipelining, and hierarchical memory systems.',
      fullSyllabus: 'RISC vs CISC, pipeline hazards, branch prediction, cache mapping techniques, virtual memory TLB, and DMA controllers.',
    },
  });

  const subjectSE = await prisma.subject.upsert({
    where: { code: 'CS601' },
    update: {},
    create: {
      code: 'CS601',
      name: 'Software Engineering & Agile Methodologies',
      departmentId: deptCSE.id,
      semesterId: semesters[6],
      credits: 3,
      coordinator: 'Dr. Ravi Kumar',
      description: 'SDLC models, agile sprint planning, requirement engineering, UML diagrams, test-driven development, and CI/CD workflows.',
    },
  });

  console.log('✓ Subjects seeded (DBMS, OS, CN, DSA, COA, SE)');

  // 7. Course Offerings & Variable Assessment Patterns
  // Offering 1: DBMS (CS501) + Dr. Ravi Kumar + 2025-26
  const offeringDBMS_Ravi_2526 = await prisma.courseOffering.upsert({
    where: {
      subjectId_teacherId_academicYearId: {
        subjectId: subjectDBMS.id,
        teacherId: teacherRavi.id,
        academicYearId: year2526.id,
      },
    },
    update: {},
    create: {
      subjectId: subjectDBMS.id,
      teacherId: teacherRavi.id,
      academicYearId: year2526.id,
    },
  });

  const pattern1 = await prisma.assessmentPattern.upsert({
    where: { courseOfferingId: offeringDBMS_Ravi_2526.id },
    update: {},
    create: {
      courseOfferingId: offeringDBMS_Ravi_2526.id,
      totalMarks: 100,
      note: 'Dr. Ravi Kumar 2025-26 Scheme: Balanced continuous tests with hands-on semester database project.',
    },
  });

  await prisma.assessmentComponent.deleteMany({ where: { assessmentPatternId: pattern1.id } });
  await prisma.assessmentComponent.createMany({
    data: [
      { assessmentPatternId: pattern1.id, name: 'CT-1 (Continuous Test 1)', type: 'TEST', maxMarks: 20, order: 1 },
      { assessmentPatternId: pattern1.id, name: 'CT-2 (Continuous Test 2)', type: 'TEST', maxMarks: 20, order: 2 },
      { assessmentPatternId: pattern1.id, name: 'Database Mini-Project', type: 'PROJECT', maxMarks: 20, order: 3 },
      { assessmentPatternId: pattern1.id, name: 'Final Assessment Exam', type: 'FINAL', maxMarks: 40, order: 4 },
    ],
  });

  // Offering 2: DBMS (CS501) + Dr. Ravi Kumar + 2024-25 (DIFFERENT PATTERN!)
  const offeringDBMS_Ravi_2425 = await prisma.courseOffering.upsert({
    where: {
      subjectId_teacherId_academicYearId: {
        subjectId: subjectDBMS.id,
        teacherId: teacherRavi.id,
        academicYearId: year2425.id,
      },
    },
    update: {},
    create: {
      subjectId: subjectDBMS.id,
      teacherId: teacherRavi.id,
      academicYearId: year2425.id,
    },
  });

  const pattern2 = await prisma.assessmentPattern.upsert({
    where: { courseOfferingId: offeringDBMS_Ravi_2425.id },
    update: {},
    create: {
      courseOfferingId: offeringDBMS_Ravi_2425.id,
      totalMarks: 100,
      note: 'Dr. Ravi Kumar 2024-25 Scheme: Emphasized final exam weightage of 50%.',
    },
  });

  await prisma.assessmentComponent.deleteMany({ where: { assessmentPatternId: pattern2.id } });
  await prisma.assessmentComponent.createMany({
    data: [
      { assessmentPatternId: pattern2.id, name: 'CT-1 (Continuous Test 1)', type: 'TEST', maxMarks: 15, order: 1 },
      { assessmentPatternId: pattern2.id, name: 'CT-2 (Continuous Test 2)', type: 'TEST', maxMarks: 15, order: 2 },
      { assessmentPatternId: pattern2.id, name: 'Term Project', type: 'PROJECT', maxMarks: 20, order: 3 },
      { assessmentPatternId: pattern2.id, name: 'Final Theory Assessment', type: 'FINAL', maxMarks: 50, order: 4 },
    ],
  });

  // Offering 3: DBMS (CS501) + Dr. Anil Sharma + 2024-25 (TEACHER B HAS DIFFERENT PATTERN!)
  const offeringDBMS_Anil_2425 = await prisma.courseOffering.upsert({
    where: {
      subjectId_teacherId_academicYearId: {
        subjectId: subjectDBMS.id,
        teacherId: teacherAnil.id,
        academicYearId: year2425.id,
      },
    },
    update: {},
    create: {
      subjectId: subjectDBMS.id,
      teacherId: teacherAnil.id,
      academicYearId: year2425.id,
    },
  });

  const pattern3 = await prisma.assessmentPattern.upsert({
    where: { courseOfferingId: offeringDBMS_Anil_2425.id },
    update: {},
    create: {
      courseOfferingId: offeringDBMS_Anil_2425.id,
      totalMarks: 100,
      note: 'Dr. Anil Sharma 2024-25 Scheme: Includes rigorous SQL homework assignments.',
    },
  });

  await prisma.assessmentComponent.deleteMany({ where: { assessmentPatternId: pattern3.id } });
  await prisma.assessmentComponent.createMany({
    data: [
      { assessmentPatternId: pattern3.id, name: 'CT-1 (Continuous Test 1)', type: 'TEST', maxMarks: 20, order: 1 },
      { assessmentPatternId: pattern3.id, name: 'CT-2 (Continuous Test 2)', type: 'TEST', maxMarks: 15, order: 2 },
      { assessmentPatternId: pattern3.id, name: 'SQL Query Assignment', type: 'ASSIGNMENT', maxMarks: 10, order: 3 },
      { assessmentPatternId: pattern3.id, name: 'ER & Schema Project', type: 'PROJECT', maxMarks: 10, order: 4 },
      { assessmentPatternId: pattern3.id, name: 'Final Assessment Exam', type: 'FINAL', maxMarks: 45, order: 5 },
    ],
  });

  // Offering 4: Operating Systems (CS502) + Dr. Rajesh Menon + 2025-26
  const offeringOS_Rajesh_2526 = await prisma.courseOffering.upsert({
    where: {
      subjectId_teacherId_academicYearId: {
        subjectId: subjectOS.id,
        teacherId: teacherRajesh.id,
        academicYearId: year2526.id,
      },
    },
    update: {},
    create: {
      subjectId: subjectOS.id,
      teacherId: teacherRajesh.id,
      academicYearId: year2526.id,
    },
  });

  const patternOS = await prisma.assessmentPattern.upsert({
    where: { courseOfferingId: offeringOS_Rajesh_2526.id },
    update: {},
    create: {
      courseOfferingId: offeringOS_Rajesh_2526.id,
      totalMarks: 100,
      note: 'Dr. Rajesh Menon 2025-26 Scheme: Incorporates online surprise quizzes and OS lab project.',
    },
  });

  await prisma.assessmentComponent.deleteMany({ where: { assessmentPatternId: patternOS.id } });
  await prisma.assessmentComponent.createMany({
    data: [
      { assessmentPatternId: patternOS.id, name: 'Quiz Series (Best 2 of 3)', type: 'QUIZ', maxMarks: 10, order: 1 },
      { assessmentPatternId: patternOS.id, name: 'Midterm Examination', type: 'TEST', maxMarks: 30, order: 2 },
      { assessmentPatternId: patternOS.id, name: 'Kernel/Threading Lab Project', type: 'PROJECT', maxMarks: 20, order: 3 },
      { assessmentPatternId: patternOS.id, name: 'End Semester Theory Exam', type: 'FINAL', maxMarks: 40, order: 4 },
    ],
  });

  // Offering 5: Computer Networks (CS503) + Prof. Sunita Rao + 2025-26
  const offeringCN_Sunita_2526 = await prisma.courseOffering.upsert({
    where: {
      subjectId_teacherId_academicYearId: {
        subjectId: subjectCN.id,
        teacherId: teacherSunita.id,
        academicYearId: year2526.id,
      },
    },
    update: {},
    create: {
      subjectId: subjectCN.id,
      teacherId: teacherSunita.id,
      academicYearId: year2526.id,
    },
  });

  const patternCN = await prisma.assessmentPattern.upsert({
    where: { courseOfferingId: offeringCN_Sunita_2526.id },
    update: {},
    create: {
      courseOfferingId: offeringCN_Sunita_2526.id,
      totalMarks: 100,
      note: 'Prof. Sunita Rao Scheme: Two 25-mark continuous tests and 50-mark final assessment.',
    },
  });

  await prisma.assessmentComponent.deleteMany({ where: { assessmentPatternId: patternCN.id } });
  await prisma.assessmentComponent.createMany({
    data: [
      { assessmentPatternId: patternCN.id, name: 'Continuous Test 1 (CT-1)', type: 'TEST', maxMarks: 25, order: 1 },
      { assessmentPatternId: patternCN.id, name: 'Continuous Test 2 (CT-2)', type: 'TEST', maxMarks: 25, order: 2 },
      { assessmentPatternId: patternCN.id, name: 'Final Assessment Examination', type: 'FINAL', maxMarks: 50, order: 3 },
    ],
  });

  console.log('✓ Course Offerings and Variable Assessment Patterns created');

  // 8. Create Tags
  const tagNames = ['important', 'repeated-questions', 'sql', 'normalization', 'bcnf', 'transactions', 'acid', 'concurrency', 'cpu-scheduling', 'deadlocks', 'semaphores', 'paging', 'virtual-memory', 'subnetting', 'tcp-udp', 'routing', 'unit-1', 'unit-2', 'unit-3', 'unit-4', 'unit-5'];
  const tagMap: Record<string, string> = {};

  for (const tName of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { name: tName },
      update: {},
      create: { name: tName },
    });
    tagMap[tName] = tag.id;
  }
  console.log('✓ Tags created');

  // 9. Generate Sample Question Paper PDFs on disk and register in DB
  console.log('📄 Generating academic sample question paper PDFs...');

  // Paper 1: DBMS CT-1 2025-26 (Dr. Ravi Kumar)
  const pdf1 = await saveSamplePdfToDisk('CS501_CT1_2025_26_RaviKumar.pdf', {
    department: 'Computer Science & Engineering',
    subjectCode: 'CS501',
    subjectName: 'Database Management Systems',
    teacherName: 'Dr. Ravi Kumar',
    academicYear: '2025-26',
    assessmentType: 'Continuous Test 1 (CT-1)',
    maxMarks: 20,
    durationMinutes: 60,
    examDate: '15 September 2025',
    questions: [
      {
        section: 'Part A — Core Conceptual Questions',
        instructions: 'Answer all questions. Each question carries 2 marks.',
        items: [
          { qNum: '1', text: 'Differentiate between Logical Data Independence and Physical Data Independence with a suitable example.', marks: 2 },
          { qNum: '2', text: 'Explain the three levels of DBMS architecture (ANSI/SPARC) and their significance.', marks: 2 },
          { qNum: '3', text: 'Define foreign key constraint and specify the effect of ON DELETE CASCADE.', marks: 2 },
        ],
      },
      {
        section: 'Part B — Analytical & Design Problems',
        instructions: 'Answer both questions. Each carries 7 marks.',
        items: [
          { qNum: '4', text: 'Design an Entity-Relationship (ER) diagram for a University Examination System showing cardinality ratios and primary keys.', marks: 7 },
          { qNum: '5', text: 'Convert the designed ER diagram into a set of Relational Tables, clearly identifying primary and foreign keys.', marks: 7 },
        ],
      },
    ],
  });

  const p1 = await prisma.questionPaper.create({
    data: {
      courseOfferingId: offeringDBMS_Ravi_2526.id,
      assessmentType: 'CT-1',
      title: 'DBMS Continuous Test 1 — ER Modeling & Relational Schema',
      examDate: '2025-09-15',
      maxMarks: 20,
      durationMinutes: 60,
      fileUrl: pdf1.relativeUrl,
      fileName: 'CS501_CT1_2025_26_RaviKumar.pdf',
      fileSize: pdf1.size,
      pageCount: 1,
      solutionNotes: 'Part B ER diagram solution requires 4 strong entities: Student, Course, Exam, Grade.',
      status: 'APPROVED',
      uploadedById: admin.id,
    },
  });

  await prisma.paperTag.createMany({
    data: [
      { paperId: p1.id, tagId: tagMap['important'] },
      { paperId: p1.id, tagId: tagMap['unit-1'] },
      { paperId: p1.id, tagId: tagMap['unit-2'] },
    ],
  });

  // Paper 2: DBMS CT-2 2025-26 (Dr. Ravi Kumar)
  const pdf2 = await saveSamplePdfToDisk('CS501_CT2_2025_26_RaviKumar.pdf', {
    department: 'Computer Science & Engineering',
    subjectCode: 'CS501',
    subjectName: 'Database Management Systems',
    teacherName: 'Dr. Ravi Kumar',
    academicYear: '2025-26',
    assessmentType: 'Continuous Test 2 (CT-2)',
    maxMarks: 20,
    durationMinutes: 60,
    examDate: '28 October 2025',
    questions: [
      {
        section: 'Part A — Theory of Relational Decomposition',
        instructions: 'Answer both questions.',
        items: [
          { qNum: '1', text: 'State Armstrong Axioms for functional dependencies (Transitivity, Augmentation, Reflexivity).', marks: 4 },
          { qNum: '2', text: 'Explain the difference between 3NF and BCNF with a counterexample.', marks: 6 },
        ],
      },
      {
        section: 'Part B — Normalization & SQL Queries',
        instructions: 'Solve the relational problem.',
        items: [
          { qNum: '3', text: 'Given relation R(A, B, C, D, E) with F = {A->BC, CD->E, B->D, E->A}. Find all candidate keys and decompose R into BCNF.', marks: 10 },
        ],
      },
    ],
  });

  const p2 = await prisma.questionPaper.create({
    data: {
      courseOfferingId: offeringDBMS_Ravi_2526.id,
      assessmentType: 'CT-2',
      title: 'DBMS Continuous Test 2 — Normalization & BCNF Decomposition',
      examDate: '2025-10-28',
      maxMarks: 20,
      durationMinutes: 60,
      fileUrl: pdf2.relativeUrl,
      fileName: 'CS501_CT2_2025_26_RaviKumar.pdf',
      fileSize: pdf2.size,
      pageCount: 1,
      solutionNotes: 'Candidate keys are A, E, and BC. Decompositions preserve functional dependencies.',
      status: 'APPROVED',
      uploadedById: admin.id,
    },
  });

  await prisma.paperTag.createMany({
    data: [
      { paperId: p2.id, tagId: tagMap['normalization'] },
      { paperId: p2.id, tagId: tagMap['bcnf'] },
      { paperId: p2.id, tagId: tagMap['sql'] },
      { paperId: p2.id, tagId: tagMap['repeated-questions'] },
    ],
  });

  // Paper 3: DBMS Final Assessment 2025-26 (Dr. Ravi Kumar)
  const pdf3 = await saveSamplePdfToDisk('CS501_Final_2025_26_RaviKumar.pdf', {
    department: 'Computer Science & Engineering',
    subjectCode: 'CS501',
    subjectName: 'Database Management Systems',
    teacherName: 'Dr. Ravi Kumar',
    academicYear: '2025-26',
    assessmentType: 'Final Assessment Examination',
    maxMarks: 40,
    durationMinutes: 120,
    examDate: '12 December 2025',
    questions: [
      {
        section: 'Part A — SQL & Indexing Operations',
        instructions: 'Answer all questions. (16 Marks Total)',
        items: [
          { qNum: '1', text: 'Write SQL queries to find the 2nd highest salary using dense_rank() window function.', marks: 4 },
          { qNum: '2', text: 'Construct a B+ Tree of order 3 inserting keys: 10, 20, 5, 15, 30, 25, 35.', marks: 6 },
          { qNum: '3', text: 'Explain how hashing collisions are handled in bucket overflow chains.', marks: 6 },
        ],
      },
      {
        section: 'Part B — Transaction Management & Concurrency Control',
        instructions: 'Answer all questions. (24 Marks Total)',
        items: [
          { qNum: '4', text: 'Prove why Strict Two-Phase Locking (Strict 2PL) guarantees conflict serializability and prevents cascading rollbacks.', marks: 12 },
          { qNum: '5', text: 'Describe the ARIES recovery algorithm phases: Analysis, Redo, and Undo with Write-Ahead Logging (WAL).', marks: 12 },
        ],
      },
    ],
  });

  const p3 = await prisma.questionPaper.create({
    data: {
      courseOfferingId: offeringDBMS_Ravi_2526.id,
      assessmentType: 'Final Assessment',
      title: 'DBMS Final Comprehensive Examination — Complete 5-Unit Pattern',
      examDate: '2025-12-12',
      maxMarks: 40,
      durationMinutes: 120,
      fileUrl: pdf3.relativeUrl,
      fileName: 'CS501_Final_2025_26_RaviKumar.pdf',
      fileSize: pdf3.size,
      pageCount: 1,
      solutionNotes: 'Comprehensive solution covers dense_rank, B+ tree splits, and ARIES log analysis.',
      status: 'APPROVED',
      uploadedById: admin.id,
    },
  });

  await prisma.paperTag.createMany({
    data: [
      { paperId: p3.id, tagId: tagMap['transactions'] },
      { paperId: p3.id, tagId: tagMap['acid'] },
      { paperId: p3.id, tagId: tagMap['concurrency'] },
      { paperId: p3.id, tagId: tagMap['important'] },
    ],
  });

  // Paper 4: DBMS CT-1 2024-25 (Dr. Ravi Kumar)
  const pdf4 = await saveSamplePdfToDisk('CS501_CT1_2024_25_RaviKumar.pdf', {
    department: 'Computer Science & Engineering',
    subjectCode: 'CS501',
    subjectName: 'Database Management Systems',
    teacherName: 'Dr. Ravi Kumar',
    academicYear: '2024-25',
    assessmentType: 'Continuous Test 1 (CT-1)',
    maxMarks: 15,
    durationMinutes: 50,
    examDate: '20 September 2024',
    questions: [
      {
        section: 'Part A — Foundations',
        instructions: 'Answer all questions.',
        items: [
          { qNum: '1', text: 'Explain the ACID properties of a database transaction with practical banking transfer examples.', marks: 5 },
          { qNum: '2', text: 'Compare Relational Algebra operations Selection and Projection with SQL equivalent clauses.', marks: 5 },
          { qNum: '3', text: 'What is a composite primary key? Give an example schema.', marks: 5 },
        ],
      },
    ],
  });

  const p4 = await prisma.questionPaper.create({
    data: {
      courseOfferingId: offeringDBMS_Ravi_2425.id,
      assessmentType: 'CT-1',
      title: 'DBMS CT-1 (2024-25 Pattern — 15 Marks)',
      examDate: '2024-09-20',
      maxMarks: 15,
      durationMinutes: 50,
      fileUrl: pdf4.relativeUrl,
      fileName: 'CS501_CT1_2024_25_RaviKumar.pdf',
      fileSize: pdf4.size,
      pageCount: 1,
      status: 'APPROVED',
      uploadedById: contributor.id,
    },
  });

  // Paper 5: DBMS Final Assessment 2024-25 (Dr. Ravi Kumar)
  const pdf5 = await saveSamplePdfToDisk('CS501_Final_2024_25_RaviKumar.pdf', {
    department: 'Computer Science & Engineering',
    subjectCode: 'CS501',
    subjectName: 'Database Management Systems',
    teacherName: 'Dr. Ravi Kumar',
    academicYear: '2024-25',
    assessmentType: 'Final Assessment Examination',
    maxMarks: 50,
    durationMinutes: 180,
    examDate: '10 December 2024',
    questions: [
      {
        section: 'Part A — Full Syllabus Comprehensive',
        instructions: 'Answer all questions. (50 Marks)',
        items: [
          { qNum: '1', text: 'Derive the equivalence rules for heuristic query optimization in relational algebra.', marks: 15 },
          { qNum: '2', text: 'Explain multi-granularity locking protocol and intention locks (IS, IX, SIX).', marks: 15 },
          { qNum: '3', text: 'Compare optimistic concurrency control with timestamp ordering algorithms.', marks: 20 },
        ],
      },
    ],
  });

  const p5 = await prisma.questionPaper.create({
    data: {
      courseOfferingId: offeringDBMS_Ravi_2425.id,
      assessmentType: 'Final Assessment',
      title: 'DBMS Final Theory Paper (2024-25 — 50 Marks Scheme)',
      examDate: '2024-12-10',
      maxMarks: 50,
      durationMinutes: 180,
      fileUrl: pdf5.relativeUrl,
      fileName: 'CS501_Final_2024_25_RaviKumar.pdf',
      fileSize: pdf5.size,
      pageCount: 1,
      status: 'APPROVED',
      uploadedById: admin.id,
    },
  });

  // Paper 6: DBMS CT-1 2024-25 (Dr. Anil Sharma)
  const pdf6 = await saveSamplePdfToDisk('CS501_CT1_2024_25_AnilSharma.pdf', {
    department: 'Computer Science & Engineering',
    subjectCode: 'CS501',
    subjectName: 'Database Management Systems',
    teacherName: 'Dr. Anil Sharma',
    academicYear: '2024-25',
    assessmentType: 'Continuous Test 1 (CT-1)',
    maxMarks: 20,
    durationMinutes: 60,
    examDate: '25 September 2024',
    questions: [
      {
        section: 'Part A — Formal Relational Theory',
        instructions: 'Answer all questions.',
        items: [
          { qNum: '1', text: 'Define Tuple Relational Calculus (TRC) and write a TRC expression to find employees who work on all projects.', marks: 10 },
          { qNum: '2', text: 'Explain lossless-join decomposition and dependency preservation theorems with mathematical proofs.', marks: 10 },
        ],
      },
    ],
  });

  await prisma.questionPaper.create({
    data: {
      courseOfferingId: offeringDBMS_Anil_2425.id,
      assessmentType: 'CT-1',
      title: 'DBMS Continuous Test 1 (Dr. Anil Sharma Pattern)',
      examDate: '2024-09-25',
      maxMarks: 20,
      durationMinutes: 60,
      fileUrl: pdf6.relativeUrl,
      fileName: 'CS501_CT1_2024_25_AnilSharma.pdf',
      fileSize: pdf6.size,
      pageCount: 1,
      status: 'APPROVED',
      uploadedById: admin.id,
    },
  });

  // Paper 7: Operating Systems Midterm 2025-26 (Dr. Rajesh Menon)
  const pdf7 = await saveSamplePdfToDisk('CS502_Midterm_2025_26_RajeshMenon.pdf', {
    department: 'Computer Science & Engineering',
    subjectCode: 'CS502',
    subjectName: 'Operating Systems',
    teacherName: 'Dr. Rajesh Menon',
    academicYear: '2025-26',
    assessmentType: 'Midterm Examination',
    maxMarks: 30,
    durationMinutes: 90,
    examDate: '18 October 2025',
    questions: [
      {
        section: 'Part A — Concurrency & Deadlocks',
        instructions: 'Answer all questions. (30 Marks)',
        items: [
          { qNum: '1', text: 'Consider 5 processes P0 to P4 with Allocation and Max matrices. Check whether the system is in a safe state using Bankers Algorithm.', marks: 15 },
          { qNum: '2', text: 'Implement Readers-Writers problem using counting semaphores ensuring writer starvation is prevented.', marks: 15 },
        ],
      },
    ],
  });

  const p7 = await prisma.questionPaper.create({
    data: {
      courseOfferingId: offeringOS_Rajesh_2526.id,
      assessmentType: 'Midterm',
      title: 'OS Midterm Exam — Process Synchronization, Deadlocks & Bankers Algorithm',
      examDate: '2025-10-18',
      maxMarks: 30,
      durationMinutes: 90,
      fileUrl: pdf7.relativeUrl,
      fileName: 'CS502_Midterm_2025_26_RajeshMenon.pdf',
      fileSize: pdf7.size,
      pageCount: 1,
      solutionNotes: 'Safe sequence is <P1, P3, P4, P0, P2>. Semaphores solution requires priority counter.',
      status: 'APPROVED',
      uploadedById: admin.id,
    },
  });

  await prisma.paperTag.createMany({
    data: [
      { paperId: p7.id, tagId: tagMap['cpu-scheduling'] },
      { paperId: p7.id, tagId: tagMap['deadlocks'] },
      { paperId: p7.id, tagId: tagMap['semaphores'] },
      { paperId: p7.id, tagId: tagMap['important'] },
    ],
  });

  // Paper 8: Computer Networks CT-1 2025-26 (Prof. Sunita Rao)
  const pdf8 = await saveSamplePdfToDisk('CS503_CT1_2025_26_SunitaRao.pdf', {
    department: 'Computer Science & Engineering',
    subjectCode: 'CS503',
    subjectName: 'Computer Networks',
    teacherName: 'Prof. Sunita Rao',
    academicYear: '2025-26',
    assessmentType: 'CT-1',
    maxMarks: 25,
    durationMinutes: 75,
    examDate: '05 October 2025',
    questions: [
      {
        section: 'Part A — Physical & Link Layer Analysis',
        instructions: 'Answer both questions.',
        items: [
          { qNum: '1', text: 'An IP packet with length 4000 bytes arrives at a router with MTU of 1500 bytes. Show all fragments with offset, MF flag, and length.', marks: 12 },
          { qNum: '2', text: 'Calculate the CRC remainder for message M = 1101011011 using generator polynomial G(x) = x^4 + x + 1.', marks: 13 },
        ],
      },
    ],
  });

  const p8 = await prisma.questionPaper.create({
    data: {
      courseOfferingId: offeringCN_Sunita_2526.id,
      assessmentType: 'CT-1',
      title: 'Computer Networks Continuous Test 1 — IP Fragmentation & CRC Coding',
      examDate: '2025-10-05',
      maxMarks: 25,
      durationMinutes: 75,
      fileUrl: pdf8.relativeUrl,
      fileName: 'CS503_CT1_2025_26_SunitaRao.pdf',
      fileSize: pdf8.size,
      pageCount: 1,
      status: 'APPROVED',
      uploadedById: admin.id,
    },
  });

  await prisma.paperTag.createMany({
    data: [
      { paperId: p8.id, tagId: tagMap['subnetting'] },
      { paperId: p8.id, tagId: tagMap['important'] },
      { paperId: p8.id, tagId: tagMap['repeated-questions'] },
    ],
  });

  // 10. Student Bookmarks
  await prisma.bookmark.create({
    data: {
      userId: student.id,
      paperId: p1.id,
      subjectId: subjectDBMS.id,
    },
  });

  await prisma.bookmark.create({
    data: {
      userId: student.id,
      paperId: p7.id,
      subjectId: subjectOS.id,
    },
  });

  console.log('✓ Student bookmarks seeded');
  console.log('🎉 Academic knowledge repository seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
