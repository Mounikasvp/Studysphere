import React, { useState, useEffect } from 'react';
import { Input, List, Avatar, Button, Loader, Message, toaster } from 'rsuite';
import { getAllUsers } from '../misc/invitation-service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUserPlus, faCheck } from '@fortawesome/free-solid-svg-icons';

const UserSearch = ({ onSelect, selectedUsers = [], excludeUsers = [] }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        const allUsers = await getAllUsers();
        
        // Filter out excluded users
        const filteredList = allUsers.filter(
          user => !excludeUsers.includes(user.uid)
        );
        
        setUsers(filteredList);
        setFilteredUsers(filteredList);
        setIsLoading(false);
      } catch (error) {
        toaster.push(
          <Message type="error" closable duration={4000}>
            Error loading users: {error.message}
          </Message>
        );
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [excludeUsers]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
      return;
    }

    const lowercasedSearch = searchTerm.toLowerCase();
    const filtered = users.filter(
      user => 
        user.name.toLowerCase().includes(lowercasedSearch) || 
        user.email.toLowerCase().includes(lowercasedSearch)
    );
    
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleSearch = value => {
    setSearchTerm(value);
  };

  const isUserSelected = userId => {
    return selectedUsers.some(user => user.uid === userId);
  };

  const handleSelect = user => {
    if (isUserSelected(user.uid)) {
      return;
    }
    
    onSelect(user);
  };

  return (
    <div className="user-search">
      <Input
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={handleSearch}
        className="mb-3"
        size="lg"
        style={{ borderRadius: '12px' }}
        startAddon={<FontAwesomeIcon icon={faSearch} />}
      />

      {isLoading ? (
        <div className="text-center py-4">
          <Loader content="Loading users..." vertical />
        </div>
      ) : (
        <List hover>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-4 text-muted">
              No users found matching "{searchTerm}"
            </div>
          ) : (
            filteredUsers.map(user => (
              <List.Item
                key={user.uid}
                style={{
                  padding: '10px',
                  borderRadius: '12px',
                  marginBottom: '8px',
                  backgroundColor: isUserSelected(user.uid) ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                  cursor: 'pointer'
                }}
                onClick={() => handleSelect(user)}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <Avatar
                      circle
                      src={user.avatar || null}
                      alt={user.name}
                      style={{ marginRight: '12px' }}
                    >
                      {user.name[0].toUpperCase()}
                    </Avatar>
                    <div>
                      <div className="font-weight-bold">{user.name}</div>
                      <div className="text-muted small">{user.email}</div>
                    </div>
                  </div>
                  <Button
                    appearance={isUserSelected(user.uid) ? "primary" : "ghost"}
                    color={isUserSelected(user.uid) ? "green" : "blue"}
                    size="sm"
                    style={{ borderRadius: '8px' }}
                    onClick={e => {
                      e.stopPropagation();
                      handleSelect(user);
                    }}
                  >
                    <FontAwesomeIcon 
                      icon={isUserSelected(user.uid) ? faCheck : faUserPlus} 
                    />
                    {isUserSelected(user.uid) ? ' Selected' : ' Select'}
                  </Button>
                </div>
              </List.Item>
            ))
          )}
        </List>
      )}
    </div>
  );
};

export default UserSearch;
