# Chat-X Backend

This is the server code for my What's App clone app (Chat-X)

# Table of Contents
1. [Architecture](#architecture)
2. [Why This Design](#why-this-design)
3. [Thoughts & Concerns](#thoughts--concerns)
4. [Install & Usage](#install--usage)

## Architecture

> **There will be two environments:**
> 1. Prod which will obviously run the production build and services in the correct production environment.
> 2. Staging which will run a Dev/stable build and services that will run in a test or staging environment. I will be the only one with access to all staging resources/services. This will serve for all testing and QA screening before deploying the production version. 

**Below is the list of services/resources that will be used.**

- [Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/?gclid=CjwKCAiAmZGrBhAnEiwAo9qHicJp1-Vd40eYIgN__v_CSFRZSiPSwYVcx0CdyOqv9ttgTBSZ040TPxoCkxMQAvD_BwE&trk=b1c3dd7d-1b94-4b82-99e3-c1505e3a55fb&sc_channel=ps&ef_id=CjwKCAiAmZGrBhAnEiwAo9qHicJp1-Vd40eYIgN__v_CSFRZSiPSwYVcx0CdyOqv9ttgTBSZ040TPxoCkxMQAvD_BwE:G:s&s_kwcid=AL!4422!3!651737511569!e!!g!!amazon%20beanstalk!19845796021!146736269029):
    An AWS service that allows you to deploy web apps & additional services. Only need to provide the backend code and runtime then deploy the two necessary environments with the right permissions. The default services that are created will be reviewed and adjusted based on the needs for this chat app.

    - **EC2 instance – An Amazon Elastic Compute Cloud (Amazon EC2) virtual machine configured to run a [Node](https://nodejs.org/en) in my case. I chose to run pnpm instead of the regular npm for package management. [PNPM](https://pnpm.io/) is excellent for a mono repo/app but we only need EB to handle our backend service.**

    > Each platform runs a specific set of software, configuration files, and scripts to support a specific language version, framework, web container, or combination of these. Most platforms use either Apache or NGINX as a reverse proxy that sits in front of your web app, forwards requests to it, serves static assets, and generates access and error logs.

    - **Instance security group – An Amazon EC2 security group configured to allow inbound traffic on port 80.**
    
    > This resource lets HTTP traffic from the load balancer reach the EC2 instance running the web app. By default, traffic isn't allowed on other ports.

    - **Load balancer – An Elastic Load Balancing load balancer configured to distribute requests to the instances running the application.** 
    
    > A load balancer also eliminates the need to expose the instances directly to the internet.

    - **Load balancer security group – An Amazon EC2 security group configured to allow inbound traffic on port 80.** 
    
    > This resource lets HTTP traffic from the internet reach the load balancer. By default, traffic isn't allowed on other ports.

    - **Auto Scaling group – An Auto Scaling group configured to replace an instance if it is terminated or becomes unavailable.**

    - **Amazon S3 bucket – A storage location for the SPA source code, logs, and other artifacts that are created.**

    - **Amazon CloudWatch alarms – Two CloudWatch alarms that monitor the load on the instances in the environment and that are triggered if the load is too high or too low.**
    
    > When an alarm is triggered, the Auto Scaling group scales up or down in response.

    - **AWS CloudFormation stack – Elastic Beanstalk uses AWS CloudFormation to launch the resources in the environment and propagate configuration changes.**
    
    > The resources are defined in a template that you can view in the AWS CloudFormation console.

    - **Domain name – A domain name that routes to your web app in the form subdomain.region.elasticbeanstalk.com.**
- [DynamoDB](https://aws.amazon.com/dynamodb/): This the AWS solution for a noSQL Database.

### Why This Design

The purpose of this App was to improve my Fullstack & DevOps prowess. The core focus was not necessarily on the FE portion but the BE and infrastructure. This entire setup will involve the AWS ecosystem because I am going for a few AWS certs. In the future, projects I wish to build at scale wil involve further planning of what resources I wish to use instead of being locked into one platform. With the previous being stated, that has effected the rest of the architecture tremendously. This includes how the CI/CD pipeline and automation are handled. To achieve the desired outcome of having a long-term project that I can constantly learn from, I need the setup to be as simple and hassle-free as possible but within the realm of AWS. 

This is why Elastic Beanstalk was a no-brainer to use. Being able to deploy a simple app that includes all, if not most, of the necessary services can't be beat. This allows me to improve on each service/resource piece by piece without hindering my learning chance while having ease of deployment, flexibility, and reliability.

- #### The Database
DynamoDB is a managed NoSQL Database optimized for performance and scale. You can take a further look by viewing the link above but in this section I will further analyze my setup as it relates to this project. The project is a WhatsApp clone but more specifically it's a chat app. So the structure of our database has to relate to the applications needs. The key features the service required were:

    - **Chat Users**: I wanted to obviously allow first time and existing users the option to authenticate (login) to the App before being able to chat with other registered users. Anon users will not be supported at this time (12/01/23). The users also would contain a userId as well as an associated chat ids. This would allow users to lookup each other and add them to chat rooms. So the chat rooms would have their own ID (chatId) that would be given out to all associated users.

    - **Chat Rooms**: Obviously this wouldn't be a chat app without the ability to have users create/join chat rooms. Chat rooms as previously stated, have their own ID.

    - Additional Feature Ideas: I will periodically come back to this section as new features are thought about or added. After v1 I would like to include user profiles/settings, chat room settings, contacts (users can save/favorite other users.), ability to upload media, ability to share location, controlled access to chat rooms (a chat room owner can dictate who can join. In v1 all users in the chat can add additional users.), support for video & audio calls, feed chats (streamlined social media content that can be broadcast through the chat room. Think streaming a YouTube video like a watch party). These features and more will be apart of a scale plan defined after v1. Each feature will be tracked under the [issues](https://github.com/king-media/Chat-X/issues) section (along with bugs of course). 

    The first version is only an MVP we merely want to allow users to talk to each other and that is it. Future changes may affect the database outlook but for right now the setup is pretty straight forward.

**Tables**: v1 Models
    - Users: The user was outlined above.
        `{
            id: string!,
            email: string!,
            password: string!,
            creationDate: Date!,
            userName: string,
            chatRooms?: string[]
        }`
    - Chats: The model for the chat room mentioned above. 
        `{
            id: string!
            users: string[]! (userIds),
            createdAt: Date!,
        }`
     - Messages: Messages have their own model that holds the sender and chat ID + timestamp. Having this in a separate DB table allows for more flexibility with querying data.
        `{
            chatId: string!
            senderId: string! (userId)
            text: string!
            createdAt: Date!
            updatedAt: Date!
         }`
- #### Node Backend Service In Depth


### Thoughts & Concerns


## Install & Usage