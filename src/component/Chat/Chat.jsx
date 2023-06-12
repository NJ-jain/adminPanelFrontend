import React, { useState, useRef, useEffect } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { CircularProgress, Container, Typography } from "@mui/material";
import TextArea from "../TextArea/TextArea";
import { adminPanelByAI } from "../../api/dbApi";
import { Box } from "@mui/system";
import { renderToString } from "react-dom/server";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messageContainerRef = useRef(null);

  const handleMessageSubmit = async (message) => {
    const actualMessage = "Question   : " + message;
    const loadingKey = `loading-${messages.length}`;

    setMessages((prevMessages) => [
      ...prevMessages,
      { key: Date.now(), content: actualMessage },
      {
        key: loadingKey,
        content: (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress sx={{ color: "grey" }} />
          </Box>
        ),
      },
    ]);
    setIsLoading(true);

    try {
      const response = await adminPanelByAI(message);
      const data = response.data;

      let actual_response;
      if (Array.isArray(data)) {
        actual_response = "Answer   : " + data.join(", ");
      } else if (typeof data === "object") {
        actual_response = "Answer   : ";

        // Check if the data contains HTML tags
        let hasHTML = false;
        for (const key in data) {
          if (typeof data[key] === "string" && data[key].includes("<")) {
            hasHTML = true;
            break;
          }
        }

        if (hasHTML) {
          actual_response = (
            <div>
              {actual_response}
              {Object.entries(data).map(([key, value]) => (
                <div key={key}>
                  <strong>{key}:</strong>
                  <div dangerouslySetInnerHTML={{ __html: value }} />
                </div>
              ))}
            </div>
          );
        } else {
          for (const key in data) {
            actual_response += `${key}: ${data[key]}, `;
          }
          actual_response = actual_response.slice(0, -2); // Remove the trailing comma and space
        }
      } else {
        actual_response = "Answer   : " + data;
      }

      setTimeout(() => {
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          const loadingIndex = updatedMessages.findIndex(
            (msg) => msg.key === loadingKey
          );
          updatedMessages[loadingIndex] = {
            key: loadingKey,
            content: actual_response,
          };
          setIsLoading(false);
          return updatedMessages;
        });
      }, 100);
    } catch (error) {
      setTimeout(() => {
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          const loadingIndex = updatedMessages.findIndex(
            (msg) => msg.key === loadingKey
          );
          const errorMessage = error.response.data["try again some error "];
          const errorContent = (
            <Typography
              variant="body1"
              sx={{
                backgroundColor: "#ffcccc",
                padding: "8px",
                borderRadius: "4px",
                marginBottom: "8px",
              }}
            >
              {errorMessage}
            </Typography>
          );
          updatedMessages[loadingIndex] = {
            key: loadingKey,
            content: errorContent,
          };
          setIsLoading(false);
          return updatedMessages;
        });
      }, 100);
    }
  };

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      style={{
        backgroundColor: "#dadada",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Container
          ref={messageContainerRef}
          sx={{ height: "80%", overflow: "auto", marginTop: "2%" }}
        >
          <TransitionGroup>
            {messages.map((message, index) => (
              <CSSTransition
                key={message.key || index}
                timeout={500}
                classNames="message"
              >
                {message.content ? (
                  <div>
                    {index > 0 && index % 2 === 0 && (
                      <div style={{ height: 16 }}></div>
                    )}
                    <Typography
                      variant="body1"
                      className="message"
                      sx={{
                        backgroundColor: index % 2 !== 0 ? "#dadada" : "#fff",
                        fontStyle: index % 2 !== 0 ? "italic" : "normal",
                        padding: "8px",
                        borderRadius: "4px",
                        marginBottom: "8px",
                      }}
                    >
                      {typeof message.content === "object"
                        ? renderToString(message.content)
                        : message.content}
                    </Typography>
                  </div>
                ) : (
                  <Typography
                    variant="body1"
                    className="message"
                    sx={{ fontStyle: "italic", marginBottom: "8px" }}
                  >
                    {message.key}
                  </Typography>
                )}
              </CSSTransition>
            ))}
          </TransitionGroup>
        </Container>
        <TextArea onMessageSubmit={handleMessageSubmit} isLoading={isLoading} />
      </Container>
    </div>
  );
};

export default Chat;
