FROM node

ENV AWS_ACCESS_KEY_ID aws_access_key_id
ENV AWS_SECRET_ACCESS_KEY aws_secret_access_key
ENV AWS_SESSION_TOKEN aws_session_token
ENV TWITTER_KEY TWITTER_API_KEY
ENV TWITTER_B_TOKEN TWITTER_BEARER_TOKEN
ENV TWITTER_API_S_KEY TWITTER_API_SECRET_KEY
ENV TWITTER_S_TOKEN TWITTER_SECRET_TOKEN

# Copy the application folder inside the container
ADD /app /app
# Set the default directory where CMD will execute
WORKDIR /app
# Set the default command to execute when creating a new container
CMD npm start