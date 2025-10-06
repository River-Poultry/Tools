import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Stack,
  Chip,
  Avatar,
  useMediaQuery,
  useTheme,
  Paper,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  TrendingUp,
  Straighten,
  Calculate,
  CalendarToday,
  Assessment,
  Notifications,
  Download,
  Share,
  Add,
  BarChart,
  PieChart,
  Timeline,
  Restaurant,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import HeroSection from "./HeroSection";

interface QuickStats {
  totalBirds: number;
  activeProjects: number;
  upcomingVaccinations: number;
  monthlyRevenue: number;
}

interface RecentActivity {
  id: string;
  type: 'vaccination' | 'budget' | 'measurement';
  title: string;
  date: string;
  status: 'completed' | 'pending' | 'scheduled';
}

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  // Mock data - in a real app, this would come from your backend
  const [quickStats, setQuickStats] = useState<QuickStats>({
    totalBirds: 1250,
    activeProjects: 3,
    upcomingVaccinations: 2,
    monthlyRevenue: 450000,
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'vaccination',
      title: 'Broiler Vaccination Schedule - Batch A',
      date: '2024-01-15',
      status: 'scheduled'
    },
    {
      id: '2',
      type: 'budget',
      title: 'Layer Farm Budget Analysis',
      date: '2024-01-14',
      status: 'completed'
    },
    {
      id: '3',
      type: 'measurement',
      title: 'New Broiler House Design',
      date: '2024-01-13',
      status: 'completed'
    },
    {
      id: '4',
      type: 'vaccination',
      title: 'Sasso/Kroiler Health Plan',
      date: '2024-01-12',
      status: 'pending'
    }
  ]);

  const tools = [
    {
      title: "Vaccination Planner",
      description: "Plan and track vaccination schedules for your flock",
      icon: <TrendingUp sx={{ fontSize: 40, color: "#4caf50" }} />,
      path: "/vaccination",
      color: "#4caf50",
      stats: "5 schedules created"
    },
    {
      title: "House Measurement",
      description: "Calculate optimal housing dimensions for your birds",
      icon: <Straighten sx={{ fontSize: 40, color: "#2196f3" }} />,
      path: "/measurement",
      color: "#2196f3",
      stats: "3 designs completed"
    },
    {
      title: "Budget Calculator",
      description: "Plan your poultry operation finances step by step",
      icon: <Calculate sx={{ fontSize: 40, color: "#ff9800" }} />,
      path: "/budget-calculator",
      color: "#ff9800",
      stats: "8 budgets analyzed"
    },
    {
      title: "Feed Calculator",
      description: "Calculate precise feed requirements and costs",
      icon: <Restaurant sx={{ fontSize: 40, color: "#9c27b0" }} />,
      path: "/feed-calculator",
      color: "#9c27b0",
      stats: "12 calculations done"
    },
    {
      title: "Growth Tracker",
      description: "Monitor flock growth and performance metrics",
      icon: <TrendingUp sx={{ fontSize: 40, color: "#e91e63" }} />,
      path: "/growth-tracker",
      color: "#e91e63",
      stats: "4 batches tracked"
    }
  ];

  const upcomingTasks = [
    {
      title: "Vaccination Due",
      description: "Newcastle Disease booster for Broiler Batch A",
      date: "Tomorrow",
      priority: "high"
    },
    {
      title: "Budget Review",
      description: "Monthly feed cost analysis",
      date: "In 3 days",
      priority: "medium"
    },
    {
      title: "House Inspection",
      description: "Check ventilation in Layer House 2",
      date: "Next week",
      priority: "low"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'scheduled': return 'info';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", pb: 5 }}>
      <HeroSection
        title="Farm Dashboard"
        subtitle="Welcome back to your poultry management hub"
        description="Monitor your operations, track progress, and access all your farming tools from one place."
      />

      <Box sx={{ maxWidth: 1400, mx: "auto", px: isMobile ? 2 : 4, mt: -4 }}>
        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 3 }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar sx={{ bgcolor: '#4caf50', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                  <TrendingUp />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {quickStats.totalBirds.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Birds
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 3 }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar sx={{ bgcolor: '#2196f3', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                  <Assessment />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {quickStats.activeProjects}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Projects
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 3 }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar sx={{ bgcolor: '#ff9800', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                  <CalendarToday />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {quickStats.upcomingVaccinations}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Upcoming Vaccinations
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 3 }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar sx={{ bgcolor: '#9c27b0', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                  <BarChart />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {formatCurrency(quickStats.monthlyRevenue)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monthly Revenue
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Tools Section */}
          <Grid xs={12} lg={8}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" fontWeight="bold">
                    Quick Access Tools
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    size="small"
                  >
                    New Project
                  </Button>
                </Box>
                
                <Grid container spacing={3}>
                  {tools.map((tool, index) => (
                    <Grid xs={12} md={4} key={index}>
                      <Card
                        sx={{
                          height: '100%',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          border: '2px solid transparent',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 6,
                            borderColor: tool.color,
                          }
                        }}
                        onClick={() => navigate(tool.path)}
                      >
                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                          {tool.icon}
                          <Typography variant="h6" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                            {tool.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {tool.description}
                          </Typography>
                          <Chip
                            label={tool.stats}
                            size="small"
                            sx={{ bgcolor: `${tool.color}20`, color: tool.color }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                  Recent Activity
                </Typography>
                
                <Stack spacing={2}>
                  {recentActivity.map((activity) => (
                    <Paper
                      key={activity.id}
                      sx={{
                        p: 2,
                        border: '1px solid #e0e0e0',
                        borderRadius: 2,
                        '&:hover': { bgcolor: '#f5f5f5' }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {activity.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(activity.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Chip
                            label={activity.status}
                            size="small"
                            color={getStatusColor(activity.status) as any}
                          />
                          <Tooltip title="View Details">
                            <IconButton size="small">
                              <Share />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid xs={12} lg={4}>
            {/* Upcoming Tasks */}
            <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Notifications sx={{ mr: 1, color: '#ff9800' }} />
                  <Typography variant="h6" fontWeight="bold">
                    Upcoming Tasks
                  </Typography>
                </Box>
                
                <Stack spacing={2}>
                  {upcomingTasks.map((task, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 2,
                        borderLeft: `4px solid ${
                          task.priority === 'high' ? '#f44336' :
                          task.priority === 'medium' ? '#ff9800' : '#4caf50'
                        }`,
                        bgcolor: '#f9f9f9'
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">
                        {task.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {task.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {task.date}
                        </Typography>
                        <Chip
                          label={task.priority}
                          size="small"
                          color={getPriorityColor(task.priority) as any}
                        />
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                  Quick Actions
                </Typography>
                
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    fullWidth
                    sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#45a049' } }}
                  >
                    Export Reports
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<CalendarToday />}
                    fullWidth
                    onClick={() => navigate('/vaccination')}
                  >
                    Schedule Vaccination
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<Calculate />}
                    fullWidth
                    onClick={() => navigate('/budget-calculator')}
                  >
                    Create Budget
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<Straighten />}
                    fullWidth
                    onClick={() => navigate('/measurement')}
                  >
                    Design House
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
