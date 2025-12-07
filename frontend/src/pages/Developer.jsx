import React from 'react';

const Developer = () => {
  return (
    <div style={{ padding: '2rem', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      {/* About the Developer Section */}
      <section
        style={{
          maxWidth: "800px",
          margin: "2rem auto",
          padding: "2rem",
          textAlign: "center",
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        }}
      >
        <h2
          style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            marginBottom: "2rem",
            color: "#333",
          }}
        >
          About the Developer
        </h2>

        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            lineHeight: "1.6",
          }}
        >
          <p
            style={{
              marginBottom: "1rem",
              color: "#6b7280",
              fontSize: "1.1rem",
            }}
          >
           We are Narendra Vaniya and Shreya Vaghela, creators of ProjectPlus a platform built to simplify project management for teams, organizations, and learners. With a shared passion for problem solving and modern development, we set out to create a tool that helps people collaborate better, stay organized, and manage work with confidence.
          </p>

          <p
            style={{
              marginBottom: "2rem",
              color: "#6b7280",
              fontSize: "1.1rem",
            }}
          >
            Our mission is simple:
          build practical, smart, and user friendly solutions that make teamwork effortless.
          </p>
          <p
            style={{
              marginBottom: "2rem",
              color: "#6b7280",
              fontSize: "1.1rem",
            }}
          >
            ProjectPlus reflects what we believe in clean design, real world functionality, and technology that genuinely improves the way people work. Whether it’s students managing assignments or companies running large projects, we want to empower you with tools that keep everything on track.
          </p>
          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginBottom: "1rem",
                color: "#1f2937",
              }}
            >
              Connect with us:
            </h3>
            <p
              style={{
                marginBottom: "0.5rem",
                color: "#555",
                fontSize: "1rem",
              }}
            >
              <li><a href="https://code-yatra-pi.vercel.app/">Code Yatra Website</a></li>
            </p>
            
          </div>
        </div>
      </section>


    </div>
  );
};

export default Developer;
