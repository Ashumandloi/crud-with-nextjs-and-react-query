"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { Button, Popconfirm, message } from 'antd';

const fetchStudents = async () => {
  const { data } = await axios.get('http://localhost:3002/students');
  return data;
};

const addStudent = async (student) => {
  const { data } = await axios.post('http://localhost:3002/students', student);
  return data;
};

const updateStudent = async (student) => {
  const { data } = await axios.put(`http://localhost:3002/students/${student.id}`, student);
  return data;
};

const deleteStudent = async (id) => {
  await axios.delete(`http://localhost:3002/students/${id}`);
};

function StudentsTable() {
  const queryClient = useQueryClient();
  const [editStudent, setEditStudent] = useState(null);
  const [createFormData, setCreateFormData] = useState({ name: '', roll: '', subject: '' });
  const [editFormData, setEditFormData] = useState({ name: '', roll: '', subject: '' });

  // console.log( "fierst" ,setEditStudent);

  const { data: students, isLoading, isError, error } = useQuery({
    queryKey: ['students'],
    queryFn: fetchStudents,
  });

  const addStudentMutation = useMutation({
    mutationFn: addStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: updateStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setEditStudent(null);
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      message.success('Student deleted successfully!');
    },
    onError: () => {
      message.error('Failed to delete student.');
    },
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    addStudentMutation.mutate(createFormData);
    setCreateFormData({ name: '', roll: '', subject: '' });
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (editStudent) {
      updateStudentMutation.mutate({ ...editStudent, ...editFormData });
    }
    setEditFormData({ name: '', roll: '', subject: '' });
    setEditStudent(null);
  };

  const handleEdit = (student) => {
    setEditStudent(student);
    setEditFormData({ name: student.name, roll: student.roll, subject: student.subject });
  };

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error fetching data: {error.message}</p>;

  return (
    <div>
      <h2>Create Student</h2>
      <form onSubmit={handleCreateSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={createFormData.name}
          onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Roll"
          value={createFormData.roll}
          onChange={(e) => setCreateFormData({ ...createFormData, roll: e.target.value })}
        />
        <input
          type="text"
          placeholder="Subject"
          value={createFormData.subject}
          onChange={(e) => setCreateFormData({ ...createFormData, subject: e.target.value })}
        />
        <Button htmlType="submit" type="primary">Add Student</Button>
      </form>

      {editStudent && (
        <div>
          <h2>Edit Student</h2>
          <form onSubmit={handleUpdateSubmit}>
            <input
              type="text"
              placeholder="Name"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Roll"
              value={editFormData.roll}
              onChange={(e) => setEditFormData({ ...editFormData, roll: e.target.value })}
            />
            <input
              type="text"
              placeholder="Subject"
              value={editFormData.subject}
              onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })}
            />
            <Button htmlType="submit" type="primary">Update Student</Button>
            <Button htmlType="button" type="primary" onClick={() => setEditStudent(null)}>Cancel</Button>
          </form>
        </div>
      )}

      <table border="1" style={{ marginTop: '20px' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Roll</th>
            <th>Subject</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students && students.length > 0 ? (
            students.map((student) => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.roll}</td>
                <td>{student.subject}</td>
                <td>
                  <Button type="primary" onClick={() => handleEdit(student)}>Edit</Button>
                  
                  <Popconfirm
                    title="Are you sure to delete this student?"
                    onConfirm={() => deleteStudentMutation.mutate(student.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="primary" danger>
                      Delete
                    </Button>
                  </Popconfirm>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No students found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default StudentsTable;
