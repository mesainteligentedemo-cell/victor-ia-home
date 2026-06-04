/**
 * Automated Tasks Management API
 * Gestiona todas las tareas repetitivas con costos, métricas y metadata
 *
 * Endpoints:
 * GET    /api/automated-tasks          — Lista todas las tareas
 * GET    /api/automated-tasks/:taskId  — Detalle de una tarea
 * POST   /api/automated-tasks          — Crear/actualizar tarea
 * POST   /api/automated-tasks/:taskId/run — Registrar ejecución
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(process.cwd(), '.data');
const tasksFile = path.join(dataDir, 'automated-tasks.json');
const logsFile = path.join(dataDir, 'task-executions.jsonl');

if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (e) {
    console.error('Cannot create .data directory:', e);
  }
}

// Estructura por defecto de una tarea
const DEFAULT_TASK = {
  id: '',
  name: '',
  description: '',
  category: 'blog', // blog, social, email, etc
  status: 'active', // active, paused, completed

  // Metadata
  what: '', // Qué se hizo
  how: '', // Cómo se hizo
  why: '', // Por qué se hizo
  market: '', // Mercado objetivo
  expectedResults: '', // Resultados esperados

  // Cronograma
  startDate: new Date().toISOString(),
  endDate: null, // Vigencia
  frequency: '', // daily, weekly, monthly

  // Distribución
  channels: [], // ['blog', 'email', 'social']
  platforms: [], // ['victor-ia.xyz', 'instagram', 'linkedin']

  // Infraestructura
  software: [], // ['n8n', 'vercel', 'hubspot']
  agents: [], // Agentes Claude usados
  subAgents: [], // Sub-agentes
  skills: [], // Skills utilizadas

  // Costos mensuales
  costs: {
    apiCalls: 0,
    agents: 0,
    software: 0,
    storage: 0,
    total: 0
  },

  // Ejecuciones
  executions: [],
  lastRun: null,
  successCount: 0,
  errorCount: 0
};

function getTasks() {
  try {
    if (fs.existsSync(tasksFile)) {
      return JSON.parse(fs.readFileSync(tasksFile, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading tasks:', e);
  }
  return {};
}

function saveTasks(tasks) {
  try {
    fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 2));
  } catch (e) {
    console.error('Error saving tasks:', e);
  }
}

function getTaskStats() {
  const tasks = getTasks();
  const stats = {
    totalTasks: Object.keys(tasks).length,
    activeTasks: 0,
    totalCost: 0,
    categoryBreakdown: {}
  };

  for (const [id, task] of Object.entries(tasks)) {
    if (task.status === 'active') stats.activeTasks++;
    stats.totalCost += (task.costs?.total || 0);
    stats.categoryBreakdown[task.category] = (stats.categoryBreakdown[task.category] || 0) + 1;
  }

  return stats;
}

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET /api/automated-tasks
    if (req.method === 'GET' && req.url === '/api/automated-tasks') {
      const tasks = getTasks();
      const stats = getTaskStats();

      return res.status(200).json({
        success: true,
        stats,
        tasks: Object.values(tasks).map(task => ({
          ...task,
          costPerExecution: task.costs.total / Math.max(task.executions?.length || 1, 1)
        }))
      });
    }

    // GET /api/automated-tasks/:taskId
    if (req.method === 'GET' && req.url.includes('/api/automated-tasks/') && !req.url.includes('run')) {
      const taskId = req.url.split('/').pop();
      const tasks = getTasks();
      const task = tasks[taskId];

      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      return res.status(200).json({
        success: true,
        task: {
          ...task,
          costPerExecution: task.costs.total / Math.max(task.executions?.length || 1, 1),
          avgExecutionTime: task.executions?.length > 0
            ? Math.round(task.executions.reduce((a, b) => a + (b.duration || 0), 0) / task.executions.length)
            : 0
        }
      });
    }

    // POST /api/automated-tasks (crear/actualizar)
    if (req.method === 'POST' && req.url === '/api/automated-tasks') {
      const taskData = req.body || {};
      const taskId = taskData.id || `task_${Date.now()}`;

      const tasks = getTasks();
      tasks[taskId] = {
        ...DEFAULT_TASK,
        ...taskData,
        id: taskId,
        executions: tasks[taskId]?.executions || [],
        successCount: tasks[taskId]?.successCount || 0,
        errorCount: tasks[taskId]?.errorCount || 0
      };

      saveTasks(tasks);

      return res.status(200).json({
        success: true,
        task: tasks[taskId]
      });
    }

    // POST /api/automated-tasks/:taskId/run (registrar ejecución)
    if (req.method === 'POST' && req.url.includes('/run')) {
      const taskId = req.url.split('/')[4];
      const execution = req.body || {};

      const tasks = getTasks();
      const task = tasks[taskId];

      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      const executionRecord = {
        timestamp: new Date().toISOString(),
        status: execution.status || 'success',
        duration: execution.duration || 0,
        output: execution.output || {},
        error: execution.error || null
      };

      if (!task.executions) task.executions = [];
      task.executions.push(executionRecord);

      task.lastRun = executionRecord.timestamp;
      if (executionRecord.status === 'success') {
        task.successCount = (task.successCount || 0) + 1;
      } else {
        task.errorCount = (task.errorCount || 0) + 1;
      }

      // Mantener solo últimos 100 logs
      if (task.executions.length > 100) {
        task.executions = task.executions.slice(-100);
      }

      saveTasks(tasks);

      return res.status(200).json({
        success: true,
        execution: executionRecord,
        task: task
      });
    }

    return res.status(404).json({ success: false, error: 'Endpoint not found' });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};
