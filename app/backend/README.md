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

- [Elastic Beanstalk Env](https://aws.amazon.com/elasticbeanstalk/?gclid=CjwKCAiAmZGrBhAnEiwAo9qHicJp1-Vd40eYIgN__v_CSFRZSiPSwYVcx0CdyOqv9ttgTBSZ040TPxoCkxMQAvD_BwE&trk=b1c3dd7d-1b94-4b82-99e3-c1505e3a55fb&sc_channel=ps&ef_id=CjwKCAiAmZGrBhAnEiwAo9qHicJp1-Vd40eYIgN__v_CSFRZSiPSwYVcx0CdyOqv9ttgTBSZ040TPxoCkxMQAvD_BwE:G:s&s_kwcid=AL!4422!3!651737511569!e!!g!!amazon%20beanstalk!19845796021!146736269029):
    An AWS service that allows you to deploy web apps & additional services. Only need to provide the backend code and runtime then deploy the two necessary environments with the right permissions. The default services that are created will be reviewed and adjusted based on the needs for this chat app.

    - **EC2 instance – An Amazon Elastic Compute Cloud (Amazon EC2) virtual machine configured to run a [Docker](https://www.docker.com/) container in my case. I chose to run pnpm instead of the regular npm for package management. [PNPM](https://pnpm.io/) is excellent for a mono repo/app.**

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

### Why This Design

The purpose of this App was to improve my Fullstack & DevOps prowess. The core focus was not necessarily on the FE portion but the BE and infrastructure. This includes how the CI/CD pipeline and automation are handled. To achieve the desired outcome of having a long-term project that I can constantly learn from, I need the setup to be as simple and hassle-free as possible. 

This is why Elastic Beanstalk was a no-brainer to use. Being able to deploy a simple app that includes all, if not most, of the necessary services can't be beat. This allows me to improve on each service/resource piece by piece without hindering my learning chance while having ease of deployment, flexibility, and reliability. 

### Thoughts & Concerns


## Install & Usage