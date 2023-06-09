import React, { useState, useRef, useEffect } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { CircularProgress, Container, Typography } from "@mui/material";
import TextArea from "../TextArea/TextArea";
import { adminPanelByAI } from "../../api/dbApi";
import { Box } from "@mui/system";

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
            <CircularProgress sx={{color : "grey"}} />
          </Box>
        ),
      },
    ]);
    setIsLoading(true);

    try {
      const response = await adminPanelByAI(message);
      const data = response.data;
      const actual_response = "Answer   : " + data.success;

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
    // Scroll to the bottom of the message container
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
          sx={{ height: "80%", overflow: "auto" , marginTop : "2%"}}
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
                    {index > 0 && index % 2 === 0 && <div style={{ height: 16 }}></div>} {/* Add a gap between each pair of messages */}
                    <Typography
                      variant="body1"
                      className="message"
                      sx={{
                        backgroundColor: index % 2 !== 0 ? "#dadada" : "#fff", // Set background color based on index
                        fontStyle: index % 2 !== 0 ? "italic" : "normal",
                        padding: "8px",
                        borderRadius: "4px",
                        marginBottom: "8px",
                      }}
                    >
                      {message.content}
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
