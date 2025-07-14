import React from 'react';
    import { motion } from 'framer-motion';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Progress } from '@/components/ui/progress';
    import { Badge } from '@/components/ui/badge';
    import { 
      TrendingUp, 
      Users, 
      FolderOpen, 
      DollarSign,
      Clock,
      CheckCircle,
      AlertCircle,
      Calendar
    } from 'lucide-react';
    import { useAuth } from '@/hooks/useAuth.jsx';

    const DashboardOverview = () => {
      const { user } = useAuth();
      const isAdmin = ['admin', 'full_admin'].includes(user?.role);

      const adminStats = [
        { title: 'Total Revenue', value: '$124,500', change: '+12%', icon: DollarSign, color: 'text-green-500' },
        { title: 'Active Projects', value: '23', change: '+3', icon: FolderOpen, color: 'text-blue-500' },
        { title: 'Total Clients', value: '156', change: '+8', icon: Users, color: 'text-purple-500' },
        { title: 'Conversion Rate', value: '68%', change: '+5%', icon: TrendingUp, color: 'text-orange-500' }
      ];

      const clientStats = [
        { title: 'Active Projects', value: '3', change: 'On Track', icon: FolderOpen, color: 'text-blue-500' },
        { title: 'Completed Tasks', value: '47', change: '+12 this week', icon: CheckCircle, color: 'text-green-500' },
        { title: 'Pending Reviews', value: '2', change: 'Needs attention', icon: AlertCircle, color: 'text-orange-500' },
        { title: 'Next Deadline', value: '5 days', change: 'Website launch', icon: Calendar, color: 'text-purple-500' }
      ];

      const recentProjects = [
        { name: 'E-commerce Website', client: 'TechCorp Inc.', progress: 85, status: 'In Progress', dueDate: '2024-01-15' },
        { name: 'Mobile App Design', client: 'StartupXYZ', progress: 60, status: 'Design Phase', dueDate: '2024-01-20' },
        { name: 'Brand Identity', client: 'Creative Agency', progress: 95, status: 'Review', dueDate: '2024-01-10' },
        { name: 'SEO Optimization', client: 'Local Business', progress: 40, status: 'In Progress', dueDate: '2024-01-25' }
      ];

      const stats = isAdmin ? adminStats : clientStats;
      const roleDisplayNames = { client: 'Client', admin: 'Admin', full_admin: 'Team Manager' };

      return (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {isAdmin ? 'Admin Dashboard' : 'Welcome back, ' + (user?.name || 'User')}
              </h1>
              <p className="text-slate-800 dark:text-slate-400 mt-2">
                {isAdmin 
                  ? 'Manage your agency operations and client projects' 
                  : 'Track your project progress and stay updated'
                }
              </p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2 border-purple-500 text-purple-400 mt-4 sm:mt-0">
              {roleDisplayNames[user?.role] || 'User'}
            </Badge>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass-effect border-slate-700 card-hover">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                          <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                          <p className={`text-sm mt-1 ${stat.color}`}>{stat.change}</p>
                        </div>
                        <div className={`p-3 rounded-full bg-slate-800 ${stat.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-effect border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FolderOpen className="mr-2 h-5 w-5" />
                  {isAdmin ? 'Recent Projects' : 'Your Projects'}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {isAdmin 
                    ? 'Latest project updates and progress' 
                    : 'Track your active projects and milestones'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProjects.map((project, index) => (
                    <motion.div
                      key={project.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700"
                    >
                      <div className="flex-1 w-full">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium">{project.name}</h4>
                          <Badge variant="outline" className="text-slate-300 border-slate-600">
                            {project.status}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm mb-3">{project.client}</p>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                          <div className="flex-1 w-full">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-slate-400 text-xs">Progress</span>
                              <span className="text-slate-300 text-xs">{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="h-2" />
                          </div>
                          <div className="text-right w-full sm:w-auto">
                            <p className="text-slate-400 text-xs">Due Date</p>
                            <p className="text-slate-300 text-sm">{project.dueDate}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      );
    };

    export default DashboardOverview;