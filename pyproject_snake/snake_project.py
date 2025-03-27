import pygame
import random
from pygame.math import Vector2

pygame.init()

# Fenster
WIDTH, HEIGHT = 800, 600
BLOCK_SIZE = 20
FPS = 10  

BLACK = (0, 0, 0)
GREEN = (0, 255, 0)
RED = (255, 0, 0)
YELLOW = (255, 255, 0)
GRAY = (100, 100, 100)

screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Snake mit Bots & Hindernissen")
clock = pygame.time.Clock()
font = pygame.font.SysFont(None, 35)

# Initialisierung
def reset_game():
    global snake_pos, snake_dir, snake_body, snake_length, powerup_pos, bots, obstacles, game_over
    snake_pos = [WIDTH // 2, HEIGHT // 2]
    snake_dir = Vector2(0, 0)
    snake_body = [snake_pos.copy()]
    snake_length = 1
    obstacles = create_obstacles(8)
    bots = spawn_bots(5)
    powerup_pos = spawn_powerup()
    game_over = False

# Hindernisse
def create_obstacles(count):
    obstacle_list = []
    while len(obstacle_list) < count:
        pos = [random.randrange(0, WIDTH, BLOCK_SIZE),
               random.randrange(0, HEIGHT, BLOCK_SIZE)]
        if pos not in obstacle_list and pos != snake_pos:
            obstacle_list.append(pos)
    return obstacle_list

# Bot-Klasse
class Bot:
    def __init__(self, pos):
        self.pos = pos
        self.dir = self.get_new_direction()
        self.body = [self.pos.copy()]
        self.length = 1
        self.change_dir_timer = pygame.time.get_ticks()

    def get_new_direction(self):
        directions = [Vector2(1, 0), Vector2(-1, 0), Vector2(0, 1), Vector2(0, -1)]
        return random.choice(directions)

    def move(self):
        if pygame.time.get_ticks() - self.change_dir_timer > 1000:
            self.dir = self.get_new_direction()
            self.change_dir_timer = pygame.time.get_ticks()

        next_pos = [self.pos[0] + self.dir.x * BLOCK_SIZE, self.pos[1] + self.dir.y * BLOCK_SIZE]

        if (next_pos in obstacles or
            next_pos[0] < 0 or next_pos[0] >= WIDTH or
            next_pos[1] < 0 or next_pos[1] >= HEIGHT or
            any(next_pos in bot.body for bot in bots if bot != self)):
            self.dir = self.get_new_direction()
        elif next_pos in snake_body:
            global game_over
            game_over = True
            print ("Bot hit Snake")
        else:
            self.pos = next_pos
            self.body.append(self.pos.copy())
            if len(self.body) > self.length:
                self.body.pop(0)

    def draw(self):
        for block in self.body:
            pygame.draw.rect(screen, RED, (*block, BLOCK_SIZE, BLOCK_SIZE))

# Bots Spawnen
def spawn_bots(count):
    bot_list = []
    while len(bot_list) < count:
        pos = [random.randrange(0, WIDTH, BLOCK_SIZE),
               random.randrange(0, HEIGHT, BLOCK_SIZE)]
        if (pos not in obstacles and pos != snake_pos and
            pos not in snake_body and all(pos not in bot.body for bot in bot_list)):
            bot_list.append(Bot(pos))
    return bot_list

# Power-Ups Spawnen
def spawn_powerup():
    attempts = 0
    while attempts < 100:
        pos = [random.randrange(0, WIDTH, BLOCK_SIZE),
               random.randrange(0, HEIGHT, BLOCK_SIZE)]
        if (pos not in snake_body and pos not in obstacles and
            all(pos not in bot.body for bot in bots)):
            return pos
        attempts += 1
    return None

# Draw
def draw():
    screen.fill(BLACK)

    for obs in obstacles:
        pygame.draw.rect(screen, GRAY, (*obs, BLOCK_SIZE, BLOCK_SIZE))

    if powerup_pos:
        pygame.draw.rect(screen, YELLOW, (*powerup_pos, BLOCK_SIZE, BLOCK_SIZE))

    for block in snake_body:
        pygame.draw.rect(screen, GREEN, (*block, BLOCK_SIZE, BLOCK_SIZE))

    for bot in bots:
        bot.draw()

    score_text = font.render(f"Score: {snake_length - 1}", True, YELLOW)
    screen.blit(score_text, (10, 10))
    pygame.display.flip()

# Hauptschleife
running = True
reset_game()

while running:
    while game_over:
        screen.fill(BLACK)
        game_over_text = font.render("Game Over! Press SPACE to restart", True, YELLOW)
        screen.blit(game_over_text, (WIDTH // 2 - game_over_text.get_width() // 2, HEIGHT // 2))
        pygame.display.flip()
        
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
                game_over = False
            if event.type == pygame.KEYDOWN and event.key == pygame.K_SPACE:
                reset_game()

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    if not game_over:
        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT] and snake_dir != Vector2(1, 0):
            snake_dir = Vector2(-1, 0)
        if keys[pygame.K_RIGHT] and snake_dir != Vector2(-1, 0):
            snake_dir = Vector2(1, 0)
        if keys[pygame.K_UP] and snake_dir != Vector2(0, 1):
            snake_dir = Vector2(0, -1)
        if keys[pygame.K_DOWN] and snake_dir != Vector2(0, -1):
            snake_dir = Vector2(0, 1)

        if snake_dir.length() != 0:
            next_pos = [snake_pos[0] + snake_dir.x * BLOCK_SIZE, snake_pos[1] + snake_dir.y * BLOCK_SIZE]
            if (next_pos in snake_body or
                next_pos in obstacles or
                any(next_pos in bot.body for bot in bots) or
                next_pos[0] < 0 or next_pos[0] >= WIDTH or
                next_pos[1] < 0 or next_pos[1] >= HEIGHT):
                game_over = True
            else:
                snake_pos = next_pos
                snake_body.append(snake_pos.copy())
                if len(snake_body) > snake_length:
                    snake_body.pop(0)

        for bot in bots:
            bot.move()

        if powerup_pos and snake_pos == powerup_pos:
            snake_length += 1
            for bot in bots:
                bot.length += 1
            powerup_pos = spawn_powerup()

    draw()
    clock.tick(FPS)

pygame.quit()
