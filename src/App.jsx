import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";

const API_URL = "https://ai-chatbot-weld-chi-10.vercel.app";
function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading, imageLoading]);

  // ==========================================
  // NORMAL AI CHAT
  // ==========================================

  const sendMessage = async () => {
    if (!message.trim() || loading || imageLoading) {
      return;
    }

    const userMessage = message.trim();

    setMessages((previousMessages) => [
      ...previousMessages,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "ai",
          content: data.reply,
        },
      ]);
    } catch (error) {
      console.error("CHAT ERROR:", error);

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "ai",
          content: `Sorry, I couldn't connect to the AI.

Error: ${error.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // IMAGE GENERATION
  // ==========================================

  const generateImage = async () => {
    if (!message.trim() || imageLoading || loading) {
      return;
    }

    const prompt = message.trim();

    setMessages((previousMessages) => [
      ...previousMessages,
      {
        role: "user",
        content: `Create an image: ${prompt}`,
      },
    ]);

    setMessage("");
    setImageLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
        }),
      });

      const rawResponse = await response.text();

      let data;

      try {
        data = JSON.parse(rawResponse);
      } catch {
        throw new Error(
          `Server returned a non-JSON response. HTTP ${response.status}`
        );
      }

      if (!response.ok) {
        throw new Error(data.error || "Image generation failed");
      }

      if (!data.image) {
        throw new Error("Server did not return image data.");
      }

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "image",
          image: data.image,
        },
      ]);
    } catch (error) {
      console.error("IMAGE GENERATION ERROR:", error);

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "ai",
          content: `Image generation failed.

Error: ${error.message}`,
        },
      ]);
    } finally {
      setImageLoading(false);
    }
  };

  // ==========================================
  // KEYBOARD
  // ==========================================

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // ==========================================
  // CHAT CONTROLS
  // ==========================================

  const clearChat = () => {
    setMessages([]);
  };

  const newChat = () => {
    setMessages([]);
    setMessage("");
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className={darkMode ? "app dark" : "app light"}>

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">✦</div>

          <div>
            <h2>Tuborg AI</h2>
            <span>AI Assistant</span>
          </div>
        </div>

        <button
          className="new-chat-button"
          onClick={newChat}
        >
          <span>＋</span>
          New Chat
        </button>

        <div className="sidebar-section">
          <p className="section-title">
            Recent Chats
          </p>

          <div className="chat-history">
            {messages.length > 0 ? (
              <button className="history-item">
                <span>◌</span>
                Current conversation
              </button>
            ) : (
              <p className="empty-history">
                No recent chats
              </p>
            )}
          </div>
        </div>

        <div className="sidebar-bottom">

          <button
            className="sidebar-button"
            onClick={clearChat}
          >
            <span>⌫</span>
            Clear Chat
          </button>

          <button className="sidebar-button">
            <span>⚙</span>
            Settings
          </button>

          <button
            className="sidebar-button"
            onClick={() => setDarkMode(!darkMode)}
          >
            <span>
              {darkMode ? "☀" : "☾"}
            </span>

            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>

        </div>
      </aside>

      {/* MAIN */}
      <main className="main">

        {/* HEADER */}
        <header className="topbar">
          <div>
            <h1>Tuborg AI</h1>

            <div className="status">
              <span className="status-dot"></span>
              Online
            </div>
          </div>

          <button
            className="theme-button"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀" : "☾"}
          </button>
        </header>

        {/* CHAT */}
        <section className="chat-area">

          {messages.length === 0 ? (

            <div className="welcome">

              <div className="welcome-icon">
                ✦
              </div>

              <h2>
                How can I help you?
              </h2>

              <p>
                Ask me anything. I can help you learn,
                code, create images, brainstorm ideas,
                and more.
              </p>

              <div className="suggestions">

                <button
                  onClick={() =>
                    setMessage("Explain React in simple words")
                  }
                >
                  <span>⚛</span>
                  Explain React
                </button>

                <button
                  onClick={() =>
                    setMessage("Teach me machine learning")
                  }
                >
                  <span>◎</span>
                  Learn ML
                </button>

                <button
                  onClick={() =>
                    setMessage("Help me write Python code")
                  }
                >
                  <span>⌘</span>
                  Write Python
                </button>

                <button
                  onClick={() =>
                    setMessage("Give me a project idea")
                  }
                >
                  <span>✧</span>
                  Project ideas
                </button>

                <button
                  onClick={() =>
                    setMessage(
                      "A realistic cricket match in a packed stadium at sunset"
                    )
                  }
                >
                  <span>🖼</span>
                  Create an image
                </button>

              </div>
            </div>

          ) : (

            <div className="conversation">

              {messages.map((msg, index) => (

                <div key={index}>

                  {/* IMAGE */}
                  {msg.role === "image" ? (

                    <div className="message-row ai-row">

                      <div className="avatar ai-avatar">
                        ✦
                      </div>

                      <div className="message-bubble ai-bubble image-message">

                        <img
                          src={`data:image/png;base64,${msg.image}`}
                          alt="AI generated"
                          className="generated-image"
                        />

                      </div>

                    </div>

                  ) : (

                    /* TEXT */
                    <div
                      className={`message-row ${
                        msg.role === "user"
                          ? "user-row"
                          : "ai-row"
                      }`}
                    >

                      {msg.role === "ai" && (
                        <div className="avatar ai-avatar">
                          ✦
                        </div>
                      )}

                      <div
                        className={`message-bubble ${
                          msg.role === "user"
                            ? "user-bubble"
                            : "ai-bubble"
                        }`}
                      >

                        {msg.role === "ai" ? (
                          <ReactMarkdown>
                            {msg.content}
                          </ReactMarkdown>
                        ) : (
                          msg.content
                        )}

                      </div>

                      {msg.role === "user" && (
                        <div className="avatar user-avatar">
                          You
                        </div>
                      )}

                    </div>
                  )}

                </div>

              ))}

              {/* CHAT LOADING */}
              {loading && (
                <div className="message-row ai-row">

                  <div className="avatar ai-avatar">
                    ✦
                  </div>

                  <div className="message-bubble ai-bubble typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>

                </div>
              )}

              {/* IMAGE LOADING */}
              {imageLoading && (
                <div className="message-row ai-row">

                  <div className="avatar ai-avatar">
                    ✦
                  </div>

                  <div className="message-bubble ai-bubble image-loading">

                    <div className="image-spinner"></div>

                    <span>
                      Creating your image...
                    </span>

                  </div>

                </div>
              )}

              <div ref={messagesEndRef}></div>

            </div>

          )}

        </section>

        {/* COMPOSER */}
        <div className="composer-wrapper">

          <div className="composer">

            <textarea
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Message Tuborg AI..."
              rows="1"
              disabled={loading || imageLoading}
            />

            <button
              className="image-button"
              onClick={generateImage}
              disabled={
                !message.trim() ||
                loading ||
                imageLoading
              }
              title="Generate image"
            >
              🖼
            </button>

            <button
              className="send-button"
              onClick={sendMessage}
              disabled={
                !message.trim() ||
                loading ||
                imageLoading
              }
            >
              ↑
            </button>

          </div>

          <p className="composer-hint">
            Enter to send • Shift + Enter for new line • 🖼 Generate image
          </p>

        </div>

      </main>

    </div>
  );
}

export default App;