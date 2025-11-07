import React, { useState } from 'react';

const PublishNoteForm = () => {
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content) {
      setMessage("Note content is required!");
      alert("Note content is required!");  // Predefined message for content validation
      return;
    }

    try {
      const response = await fetch('/api/publishNote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      // Predefined success and error messages
      if (!response.ok) {
        alert("Note published successfully!");  // Predefined success message 
        setMessage("Note published successfully!"); // Optional: keep the message in state
      } else {
        alert("Failed to publish note."); // Predefined error message
        setMessage("Failed to publish note."); // Optional: store error message
      }
    } catch (error) {
      alert("Error occurred while publishing the note.");  // Predefined error message
      setMessage("Error occurred while publishing the note."); // Optional: store error message
    }
  };

  return (
    <div>
      <h1>Publish a Note</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your note content here"
          rows="4"
          cols="50"
        ></textarea>
        <br />
        <button type="submit">Publish Note</button>
      </form>
      {/* Optionally show the message below the form */}
      {message && <p>{message}</p>}
    </div>
  );
};

export default PublishNoteForm;