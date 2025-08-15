import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import CreateCandidatePage from './pages/candidates/CreateCandidatePage';
import AdminCandidatesList from './pages/candidates/AdminCandidatesList';
import EditCandidatePage from './pages/candidates/EditCandidatePage';
import VotePage from './pages/voting/VotePage';
import MyVotePage from './pages/voting/MyVotePage';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/create-candidate" element={<CreateCandidatePage />} />
        <Route path="/list-candidates" element={<AdminCandidatesList />} />
        <Route path="/update-candidate/:id/edit" element={<EditCandidatePage />} />
        <Route path="/add-vote" element={<VotePage />} />
        <Route path="/my-vote" element={<MyVotePage />} />

      </Routes>
    </Router>
  );
}

export default App;
