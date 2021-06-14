const gameState = {
  score: 0,
  starRating: 5,
  currentWaveCount: 1,
  customersServedCount: 0,
  customerIsReady: false,
  cam: {},
  readyForNextOrder: true,
  gameSpeed: 3,
  serviceCountdown: {},
  currentMusic: {},
  totalWaveCount: 3,
  countdownTimer: 1500,
};

// Gameplay scene
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // Preload images
    const baseURL =
      'https://content.codecademy.com/courses/learn-phaser/fastfoodie/';
    this.load.image('Chef', `${baseURL}art/Chef.png`);
    this.load.image('Customer-1', `${baseURL}art/Customer-1.png`);
    this.load.image('Customer-2', `${baseURL}art/Customer-2.png`);
    this.load.image('Customer-3', `${baseURL}art/Customer-3.png`);
    this.load.image('Customer-4', `${baseURL}art/Customer-4.png`);
    this.load.image('Customer-5', `${baseURL}art/Customer-5.png`);
    this.load.image('Floor-Server', `${baseURL}art/Floor-Server.png`);
    this.load.image('Floor-Customer', `${baseURL}art/Floor-Customer.png`);
    this.load.image('Tray', `${baseURL}art/Tray.png`);
    this.load.image('Barrier', `${baseURL}art/Barrier.png`);
    this.load.image('Star-full', `${baseURL}art/Star-full.png`);
    this.load.image('Star-half', `${baseURL}art/Star-half.png`);
    this.load.image('Star-empty', `${baseURL}art/Star-empty.png`);

    // Preload song
    this.load.audio('gameplayTheme', [
      `${baseURL}audio/music/2-gameplayTheme.ogg`,
      `${baseURL}audio/music/2-gameplayTheme.mp3`,
    ]); // Credit: "Pixel Song #18" by hmmm101: https://freesound.org/people/hmmm101

    // // Preload SFX
    this.load.audio('placeFoodSFX', [
      `${baseURL}audio/sfx/placeFood.ogg`,
      `${baseURL}audio/sfx/placeFood.mp3`,
    ]); // Credit: "action_02.wav" by dermotte: https://freesound.org/people/dermotte

    this.load.audio('servingCorrectSFX', [
      `${baseURL}audio/sfx/servingCorrect.ogg`,
      `${baseURL}audio/sfx/servingCorrect.mp3`,
    ]); // Credit: "Video Game SFX Positive Action Long Tail" by rhodesmas: https://freesound.org/people/djlprojects

    this.load.audio('servingIncorrectSFX', [
      `${baseURL}audio/sfx/servingIncorrect.ogg`,
      `${baseURL}audio/sfx/servingIncorrect.mp3`,
    ]); // Credit: "Incorrect 01" by rhodesmas: https://freesound.org/people/rhodesmas

    this.load.audio('servingEmptySFX', [
      `${baseURL}audio/sfx/servingEmpty.ogg`,
      `${baseURL}audio/sfx/servingEmpty.mp3`,
    ]); // Credit: "Computer Error Noise [variants of KevinVG207's Freesound#331912].wav" by Timbre: https://freesound.org/people/Timbre

    this.load.audio('fiveStarsSFX', [
      `${baseURL}audio/sfx/fiveStars.ogg`,
      `${baseURL}audio/sfx/fiveStars.mp3`,
    ]); // Credit: "Success 01" by rhodesmas: https://freesound.org/people/rhodesmas

    this.load.audio('nextWaveSFX', [
      `${baseURL}audio/sfx/nextWave.ogg`,
      `${baseURL}audio/sfx/nextWave.mp3`,
    ]); // Credit: "old fashion radio jingle 2.wav" by rhodesmas: https://freesound.org/people/chimerical
  }

  create() {
    // Automatically reset values
    this.restartGame();

    // Stop, reassign, and play the new music
    gameState.currentMusic.stop();
    // gameState.currentMusic = this.sound.add('gameplayTheme');
    gameState.currentMusic.play({ loop: true });

    // Assign SFX
    gameState.sfx = {};
    gameState.sfx.placeFood = this.sound.add('placeFoodSFX');
    gameState.sfx.servingCorrect = this.sound.add('servingCorrectSFX');
    gameState.sfx.servingIncorrect = this.sound.add('servingIncorrectSFX');
    gameState.sfx.servingEmpty = this.sound.add('servingEmptySFX');
    gameState.sfx.fiveStars = this.sound.add('fiveStarsSFX');
    gameState.sfx.nextWave = this.sound.add('nextWaveSFX');

    // Create environment sprites
    gameState.floorServer = this.add
      .sprite(gameState.cam.midPoint.x, 0, 'Floor-Server')
      .setScale(0.5)
      .setOrigin(0.5, 0);
    gameState.floorCustomer = this.add
      .sprite(
        gameState.cam.midPoint.x,
        gameState.cam.worldView.bottom,
        'Floor-Customer',
      )
      .setScale(0.5)
      .setOrigin(0.5, 1);
    gameState.table = this.add
      .sprite(gameState.cam.midPoint.x, gameState.cam.midPoint.y, 'Barrier')
      .setScale(0.5);

    // Create player and tray sprites
    gameState.tray = this.add
      .sprite(gameState.cam.midPoint.x, gameState.cam.midPoint.y, 'Tray')
      .setScale(0.5);
    gameState.player = this.add
      .sprite(gameState.cam.midPoint.x, 200, 'Chef')
      .setScale(0.5);

    // Display the score
    gameState.scoreTitleText = this.add
      .text(gameState.cam.midPoint.x, 30, 'Score', {
        fontSize: '15px',
        fill: '#666666',
      })
      .setOrigin(0.5);
    gameState.scoreText = this.add
      .text(
        gameState.cam.midPoint.x,
        gameState.scoreTitleText.y + gameState.scoreTitleText.height + 20,
        gameState.score,
        { fontSize: '30px', fill: '#000000' },
      )
      .setOrigin(0.5);

    // Display the wave count
    gameState.waveTitleText = this.add
      .text(gameState.cam.worldView.right - 20, 30, 'Wave', {
        fontSize: '64px',
        fill: '#666666',
      })
      .setOrigin(1, 1)
      .setScale(0.25);
    gameState.waveCountText = this.add
      .text(
        gameState.cam.worldView.right - 20,
        30,
        gameState.currentWaveCount + '/' + gameState.totalWaveCount,
        { fontSize: '120px', fill: '#000000' },
      )
      .setOrigin(1, 0)
      .setScale(0.25);

    gameState.customerCountText = this.add
      .text(
        gameState.cam.worldView.right - 20,
        80,
        gameState.totalCustomerCount + ' customers left',
        { fontSize: '15px', fill: '#000000' },
      )
      .setOrigin(1);

    // Generate stars
    gameState.starGroup = this.add.group();
    this.drawStars();

    // Generate wave group
    gameState.customers = this.add.group();
    this.generateWave();

    // Generate meal group
    gameState.currentMeal = this.add.group();
    gameState.currentMeal.fullnessValue = 0;

    // Create keyboard keys for this scene
    gameState.keys.Enter = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER,
    );
    gameState.keys.A = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.A,
    );
    gameState.keys.S = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.S,
    );
    gameState.keys.D = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.D,
    );
  }

  update() {
    // The previous customer was served and another customer can now be served
    if (gameState.readyForNextOrder) {
      gameState.readyForNextOrder = false;

      // Move to the next customer
      gameState.customerIsReady = false;

      if (gameState.customersServedCount > 0) {
        // Hide the fullness meter of the now previous customer
        gameState.currentCustomer.meterContainer.visible = false;

        // Move up each customer before the current one
        for (let i = 0; i < gameState.customersServedCount; i++) {
          gameState.previousCustomer = gameState.customers.children.entries[i];
          this.tweens.add({
            targets: gameState.previousCustomer,
            x: '-=300',
            angle: 0,
            duration: 750,
            ease: 'Power2',
          });
        }
      }

      // Move the new current customer to be served
      gameState.currentCustomer =
        gameState.customers.children.entries[gameState.customersServedCount];
      this.tweens.add({
        targets: gameState.currentCustomer,
        x: gameState.player.x,
        angle: 90,
        delay: 100,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
          gameState.currentCustomer.meterContainer.visible = true;
          gameState.customerIsReady = true;

          // If player is too slow, go to next order
          gameState.serviceCountdown = this.time.delayedCall(
            gameState.countdownTimer * gameState.gameSpeed,
            function () {
              this.moveCustomerLine();
            },
            [],
            this,
          );
        },
      });

      // Move the upcoming customers ahead in line
      for (let j = 0; j < gameState.customersLeftCount; j++) {
        let nextCustomer =
          gameState.customers.children.entries[
            gameState.customersServedCount + 1 + j
          ];
        let nextCustomerPositionX = 1024 + 200 * j;
        this.tweens.add({
          targets: nextCustomer,
          x: '-=200',
          delay: 200,
          duration: 1500,
          ease: 'Power2',
        });
      }
    }

    // A customer is in front of the chef
    if (gameState.customerIsReady) {
      // Shrink the current customer's timer meter
      gameState.currentCustomer.timerMeterBody.width =
        gameState.currentCustomer.meterBase.width -
        gameState.serviceCountdown.getProgress() *
          gameState.currentCustomer.meterBase.width;

      // Based on the ratio of the time, apply a color to the timer
      if (gameState.serviceCountdown.getProgress() > 0.75) {
        // Red if the timer is close to ending
        gameState.currentCustomer.timerMeterBody.setFillStyle(0xdb533a);
      } else if (gameState.serviceCountdown.getProgress() > 0.25) {
        // Orange 1/4 of the way through
        gameState.currentCustomer.timerMeterBody.setFillStyle(0xff9d00);
      } else {
        // Green when there's lots of time
        gameState.currentCustomer.timerMeterBody.setFillStyle(0x3adb40);
      }
    }

    /* KEYBOARD KEYS */
    // Press A to put burger on the tray
    if (Phaser.Input.Keyboard.JustDown(gameState.keys.A)) {
      this.placeFood('Burger', 5);
    }

    // Press S to put fries on the tray
    if (Phaser.Input.Keyboard.JustDown(gameState.keys.S)) {
      this.placeFood('Fries', 3);
    }

    // Press D to put a shake on the tray
    if (Phaser.Input.Keyboard.JustDown(gameState.keys.D)) {
      this.placeFood('Shake', 1);
    }

    // Press Enter to serve the meal
    if (Phaser.Input.Keyboard.JustDown(gameState.keys.Enter)) {
      if (!gameState.readyForNextOrder && gameState.customerIsReady) {
        gameState.serviceCountdown.remove();
        this.moveCustomerLine();
        this.updateCustomerCountText();
      }
    }
  }

  // Generate wave
  generateWave() {
    gameState.totalCustomerCount = Math.ceil(
      gameState.currentWaveCount * Math.random() * 10,
    );
    gameState.customersServedCount = 0;

    this.updateCustomerCountText();

    for (let i = 0; i < gameState.totalCustomerCount; i++) {
      // Draw each customer until it matches the customers left count
      let customerContainer = this.add.container(
        gameState.cam.worldView.right + 200 * i,
        gameState.cam.worldView.bottom - 140,
      );
      gameState.customers.add(customerContainer);

      let customerImageKey = Math.ceil(Math.random() * 5);

      let customer = this.add
        .sprite(0, 0, 'Customer-' + customerImageKey)
        .setScale(0.5);
      customerContainer.add(customer);

      // Fullness meter container
      customerContainer.fullnessMeter = this.add.group();

      // Define capacity
      customerContainer.fullnessCapacity = Math.ceil(
        Math.random() * 5 * gameState.totalWaveCount,
      );

      // If capacity is an impossible number, reshuffle it until it isn't
      while (
        customerContainer.fullnessCapacity === 12 ||
        customerContainer.fullnessCapacity === 14
      ) {
        customerContainer.fullnessCapacity =
          Math.ceil(Math.random() * 5) * gameState.totalWaveCount;
      }

      // // Add container to hold and position meters
      let meterWidth = customerContainer.fullnessCapacity * 10;
      customerContainer.meterContainer = this.add.container(
        0,
        customer.y + meterWidth / 2,
      );
      customerContainer.add(customerContainer.meterContainer);

      // Add meter base
      customerContainer.meterBase = this.add
        .rectangle(-130, customer.y, meterWidth, 33, 0x707070)
        .setOrigin(0);
      customerContainer.meterBase.setStrokeStyle(6, 0x707070);
      customerContainer.meterBase.angle = -90;
      customerContainer.meterContainer.add(customerContainer.meterBase);

      // Add timer countdown meter body
      customerContainer.timerMeterBody = this.add
        .rectangle(
          customerContainer.meterBase.x + 22,
          customer.y + 1,
          meterWidth + 4,
          12,
          0x3adb40,
        )
        .setOrigin(0);
      customerContainer.timerMeterBody.angle = -90;
      customerContainer.meterContainer.add(customerContainer.timerMeterBody);

      // Create container for individual fullness blocks
      customerContainer.fullnessMeterBlocks = [];

      // Create fullness meter blocks
      for (let j = 0; j < customerContainer.fullnessCapacity; j++) {
        customerContainer.fullnessMeterBlocks[j] = this.add
          .rectangle(
            customerContainer.meterBase.x,
            customer.y - 10 * j,
            10,
            20,
            0xdbd53a,
          )
          .setOrigin(0);
        customerContainer.fullnessMeterBlocks[j].setStrokeStyle(2, 0xb9b42e);
        customerContainer.fullnessMeterBlocks[j].angle = -90;
        customerContainer.fullnessMeter.add(
          customerContainer.fullnessMeterBlocks[j],
        );
        customerContainer.meterContainer.add(
          customerContainer.fullnessMeterBlocks[j],
        );
      }

      // Hide meters
      customerContainer.meterContainer.visible = false;
    }
  }

  // Update customer count
  updateCustomerCountText() {
    gameState.customersLeftCount =
      gameState.totalCustomerCount - gameState.customersServedCount;
    gameState.customerCountText.setText(
      'Customers left: ' + gameState.customersLeftCount,
    );
    gameState.waveCountText.setText(
      gameState.currentWaveCount + '/' + gameState.totalWaveCount,
    );
  }

  // Place food down
  placeFood(food, fullnessValue) {
    if (
      gameState.currentMeal.children.entries.length < 3 &&
      gameState.customerIsReady
    ) {
      gameState.sfx.placeFood.play();

      let Xposition = gameState.tray.x;
      switch (gameState.currentMeal.children.entries.length) {
        case 0:
          Xposition -= 90;
          break;
        case 2:
          Xposition += 90;
          break;
      }
      gameState.currentMeal
        .create(Xposition, gameState.tray.y, food)
        .setScale(0.5);
      gameState.currentMeal.fullnessValue += fullnessValue;

      // Change color of blocks to show what's left
      for (let i = 0; i < gameState.currentMeal.fullnessValue; i++) {
        if (i < gameState.currentCustomer.fullnessCapacity) {
          if (
            gameState.currentCustomer.fullnessCapacity ===
            gameState.currentMeal.fullnessValue
          ) {
            // If exactly full, show a positive color
            gameState.currentCustomer.fullnessMeterBlocks[i].setFillStyle(
              0x3adb40,
            );
            gameState.currentCustomer.fullnessMeterBlocks[i].setStrokeStyle(
              2,
              0x2eb94e,
            );
          } else if (
            gameState.currentMeal.fullnessValue >
            gameState.currentCustomer.fullnessCapacity
          ) {
            // If more full, turn red
            gameState.currentCustomer.fullnessMeterBlocks[i].setFillStyle(
              0xdb533a,
            );
            gameState.currentCustomer.fullnessMeterBlocks[i].setStrokeStyle(
              2,
              0xb92e2e,
            );
          } else {
            // Otherwise, slight color change
            gameState.currentCustomer.fullnessMeterBlocks[i].setFillStyle(
              0xfffa81,
            );
          }
        }
      }
    }
  }

  moveCustomerLine() {
    // Set current customer to be full
    gameState.currentCustomer.fullnessValue =
      gameState.currentMeal.fullnessValue;
    this.updateStars(
      game,
      gameState.currentCustomer.fullnessValue,
      gameState.currentCustomer.fullnessCapacity,
    );

    // Reset current meal by removing old children and resetting fullness
    gameState.currentMeal.clear(true);
    gameState.currentMeal.fullnessValue = 0;

    // Move to next customer
    gameState.customersServedCount += 1;

    // If all customers are done
    if (gameState.customersServedCount === gameState.totalCustomerCount) {
      gameState.currentWaveCount += 1;

      // End the game after 3 waves
      if (gameState.currentWaveCount > gameState.totalWaveCount) {
        this.scene.stop('GameScene');
        this.scene.start('WinScene');
      } else {
        // OR destroy and generate a new wave
        this.destroyWave();
        gameState.gameSpeed -= 1;
      }
    } else {
      // Send the next person
      gameState.readyForNextOrder = true;
    }
  }

  // Draw stars
  drawStars() {
    // Offset
    let starLocation = 20;

    // Kill old stars by removing them from the group
    gameState.starGroup.clear(true);

    for (let i = 0; i < gameState.starRating; i++) {
      // Draw each star until it matches the star rating
      gameState.starGroup
        .create(starLocation + 50 * i, 20, 'Star-full')
        .setOrigin(0)
        .setScale(0.5);
    }
  }

  // Update stars
  updateStars() {
    if (
      gameState.currentMeal.fullnessValue ===
      gameState.currentCustomer.fullnessCapacity
    ) {
      // If exactly full
      gameState.currentCustomer.list[0].setTint(0x3adb40);
      gameState.sfx.servingCorrect.play();

      // Update the score
      gameState.score += 100;
      gameState.scoreText.setText(gameState.score);

      // Then add a star (unless at 5 star rating already)
      if (gameState.starRating < 5) {
        gameState.starRating += 1;

        if (gameState.starRating === 5) {
          // Let player know when they reach 5 stars
          gameState.sfx.fiveStars.play();
        }
      }
    } else if (gameState.starRating > 1) {
      // If too full, remove a star
      if (gameState.fullnessValue > 0) {
        gameState.starRating -= 1;
        // Also turn the customer orange
        gameState.currentCustomer.list[0].setTint(0xdbd53a);
        gameState.sfx.servingIncorrect.play();
      } else {
        // Turn the customer red
        gameState.currentCustomer.list[0].setTint(0xdb533a);
        gameState.sfx.servingEmpty.play();
        gameState.starRating -= 2;
      }

      if (gameState.starRating < 1) {
        // If they have 1 or no stars, they lose
        this.scene.stop('GameScene');
        this.scene.start('LoseScene');
      }
    } else {
      // Lose the game if no stars
      this.scene.stop('GameScene');
      this.scene.start('LoseScene');
    }
    this.drawStars();
  }

  // Destroy wave
  destroyWave() {
    // Play next wave sound
    gameState.sfx.nextWave.play();

    // Hide meter container if visible
    gameState.currentCustomer.meterContainer.visible = false;

    // Change text origin after short pause so it's not noticeable to players
    this.time.delayedCall(
      750,
      function () {
        gameState.waveTitleText.setOrigin(0.5, 1);
        gameState.waveCountText.setOrigin(0.5, 0);
      },
      [],
      game,
    );

    // Center the wave count text
    this.tweens.add({
      targets: [gameState.waveTitleText, gameState.waveCountText],
      x: gameState.cam.midPoint.x,
      y: gameState.cam.midPoint.y,
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      delay: 750,
      ease: 'Power2',
      onComplete: () => {
        // Change text origin again after pause
        this.time.delayedCall(
          750,
          function () {
            gameState.waveTitleText.setOrigin(1, 1);
            gameState.waveCountText.setOrigin(1, 0);
          },
          [],
          game,
        );

        // Decenter the wave count text
        this.tweens.add({
          targets: [gameState.waveTitleText, gameState.waveCountText],
          x: gameState.cam.worldView.right - 20,
          y: 30,
          scaleX: 0.25,
          scaleY: 0.25,
          duration: 500,
          delay: 750,
          ease: 'Power2',
        });
      },
    });

    for (let i = 0; i < gameState.customersServedCount; i++) {
      // Move each customer forward and rotate them
      this.tweens.add({
        targets: gameState.customers.children.entries[i],
        x: '-=300',
        angle: 0,
        duration: 750,
        ease: 'Power2',
        onComplete: () => {
          // Move the customers offscreen
          this.tweens.add({
            targets: gameState.customers.children.entries[i],
            x: '-=900',
            duration: 1200,
            ease: 'Power2',
            onComplete: () => {
              // Kill old customers by removing them from the group
              gameState.customers.clear(true);
              this.generateWave();

              // Set ready for next order
              gameState.readyForNextOrder = true;
            },
          });
        },
      });
    }

    this.drawStars();
  }

  // Reset values to restart the game
  restartGame() {
    gameState.score = 0;
    gameState.starRating = 5;
    gameState.currentWaveCount = 1;
    gameState.customersServedCount = 0;
    gameState.readyForNextOrder = true;
    gameState.gameSpeed = 3;
  }
}
