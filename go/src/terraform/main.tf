# ECR
resource "aws_ecr_repository" "ipb_ecr" {
  name                 = "ecr-ring"
  image_tag_mutability = "MUTABLE"
}

# ELB

# Target group
resource "aws_lb_target_group" "ring" {
  name        = "provision-system-target-group"
  port        = 8080
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = var.vpc_id
}

# ALB
resource "aws_lb" "ring" {
  name               = "provision-system-lb"
  internal           = true
  load_balancer_type = "application"
  security_groups    = [aws_security_group.lb_sg.id]
  subnets            = var.ipb_subnets
  idle_timeout       = 120

  enable_deletion_protection = false
}

resource "aws_lb_listener" "ring_http" {
  load_balancer_arn = aws_lb.ring.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ring.arn
  }
}

# resource "aws_lb_listener" "ring_https" {
#   load_balancer_arn = aws_lb.ring.arn
#   port              = "443"
#   protocol          = "HTTPS"
#   ssl_policy        = "ELBSecurityPolicy-2016-08"
#   certificate_arn   = "arn:aws:acm:us-east-1:755651580793:certificate/71856313-eedc-40f2-8d0f-a97e0b71e3c6"

#   default_action {
#     type             = "forward"
#     target_group_arn = aws_lb_target_group.ring.arn
#   }
# }

# SG
resource "aws_security_group" "lb_sg" {
  name   = "${terraform.workspace}-ring-sg"
  vpc_id = var.vpc_id
}

resource "aws_security_group_rule" "allow_http" {
  type              = "ingress"
  from_port         = 80
  to_port           = 80
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.lb_sg.id
}

resource "aws_security_group_rule" "allow_https" {
  type              = "ingress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.lb_sg.id
}

resource "aws_security_group_rule" "allow_ip4_ip6" {
  type              = "egress"
  from_port         = 0
  to_port           = 65535
  protocol          = "all"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.lb_sg.id
}

# ECS CLUSTER
resource "aws_ecs_cluster" "ring_ecs" {
  name = "ring"
  capacity_providers = ["FARGATE"]
}

# ECS TASK DEFINITIONS
resource "aws_ecs_task_definition" "ring_backend" {
  family                = "ring"
  container_definitions = file("templates/ring-backend.json")
  execution_role_arn    = aws_iam_role.ecs_task_role.arn

  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  network_mode          = "awsvpc"
}

# ECS SERVICES
resource "aws_ecs_service" "ring_backend" {
  name                               = "ring-backend"
  cluster                            = aws_ecs_cluster.ring_ecs.id
  task_definition                    = aws_ecs_task_definition.ring_backend.arn
  desired_count                      = 1
  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 100

  launch_type = "FARGATE"

  load_balancer {
    target_group_arn = aws_lb_target_group.ring.arn
    container_name   = "ring-backend"
    container_port   = 8080
  }

  network_configuration {
    security_groups  = [aws_security_group.lb_sg.id]
    assign_public_ip = true
    subnets          = var.ipb_subnets
  }
}


# IAM Role for ECS task
data "aws_iam_policy_document" "ecs_task_policy" {
  statement {
    sid = "ECSPermissions"
    actions = [
      "*"
    ]
    resources = [
      "*"
    ]
  }
}

data "aws_iam_policy_document" "ecs_task_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_policy" "ecs_task_policy" {
  name        = "ecs-task-policy"
  path        = "/"
  description = "Allows"

  policy = data.aws_iam_policy_document.ecs_task_policy.json
}

resource "aws_iam_role" "ecs_task_role" {
  name               = "ecs-task-role"
  # assume_role_policy = local.only_in_dev == 1 ? data.aws_iam_policy_document.s3_provision_system_assume_role_policy.json : data.aws_iam_policy_document.ecs_task_assume_role_policy.json
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume_role_policy.json
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy_attachment" "ecs_task_role_policy_attachment_ecs_task" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.ecs_task_policy.arn
}


# VPV

data "aws_subnet" "subnet_1" {
  id = var.ipb_subnets[0]
}

data "aws_subnet" "subnet_2" {
  id = var.ipb_subnets[1]
}

data "aws_subnet" "subnet_3" {
  id = var.ipb_subnets[2]
}

data "aws_subnet" "subnet_4" {
  id = var.ipb_subnets[3]
}

data "aws_subnet" "subnet_5" {
  id = var.ipb_subnets[4]
}

data "aws_subnet" "subnet_6" {
  id = var.ipb_subnets[5]
}



resource "aws_security_group" "ecr_endpoint_sg" {
  name   = "${terraform.workspace}-ipb-ecr-endpoint-sg"
  vpc_id = var.vpc_id
}

resource "aws_security_group_rule" "allow_ecr_https" {
  type              = "ingress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  cidr_blocks       = [data.aws_subnet.subnet_1.cidr_block, data.aws_subnet.subnet_2.cidr_block, data.aws_subnet.subnet_3.cidr_block, data.aws_subnet.subnet_4.cidr_block, data.aws_subnet.subnet_5.cidr_block, data.aws_subnet.subnet_6.cidr_block]
  security_group_id = aws_security_group.ecr_endpoint_sg.id
}

# VPC Endpoint ECR API
resource "aws_vpc_endpoint" "ecr_api" {
  vpc_id            = var.vpc_id
  service_name      = "com.amazonaws.us-east-1.ecr.api"
  vpc_endpoint_type = "Interface"

  security_group_ids = [
    aws_security_group.ecr_endpoint_sg.id,
  ]

  subnet_ids          = var.ipb_subnets
  private_dns_enabled = true
}

resource "aws_vpc_endpoint" "ecr" {
  vpc_id            = var.vpc_id
  service_name      = "com.amazonaws.us-east-1.ecr.dkr"
  vpc_endpoint_type = "Interface"

  security_group_ids = [
    aws_security_group.ecr_endpoint_sg.id,
  ]

  subnet_ids          = var.ipb_subnets
  private_dns_enabled = true
}