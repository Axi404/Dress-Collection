class PhotoBox {
    constructor(imageUrls, imagesPerRow = 8) {
        this.imageUrls = imageUrls;
        this.imagesPerRow = imagesPerRow;
        this.container = document.querySelector(".photos");
        this.img_data = [];
        this.container_width = 0;
        this.container_height = 0;
        this.photo_width = 0;
        this.photo_height = 0;
        this.if_movable = false;
        this.mouse_x = 0;
        this.mouse_y = 0;
        this.standard_width = 1440;
        this.scale_nums = 1;

        this.createModal();
        this.createPhotoGrid();
    }

    createPhotoGrid() {
        this.container.innerHTML = '';
        const rows = Math.ceil(this.imageUrls.length / this.imagesPerRow);

        const loadPromises = [];

        for (let i = 0; i < rows; i++) {
            const row = document.createElement('div');
            row.className = 'photos_line';

            for (let j = 0; j < this.imagesPerRow; j++) {
                const index = i * this.imagesPerRow + j;
                if (index >= this.imageUrls.length) break;

                const photoDiv = document.createElement('div');
                photoDiv.className = 'photos_line_photo';

                const img = document.createElement('img');

                // 创建加载Promise
                const loadPromise = new Promise((resolve) => {
                    img.onload = () => resolve();
                });
                loadPromises.push(loadPromise);

                img.src = this.imageUrls[index];
                img.alt = `Gallery image ${index + 1}`;

                photoDiv.appendChild(img);
                row.appendChild(photoDiv);
            }

            this.container.appendChild(row);
        }

        // 等待所有图片加载完成后初始化
        Promise.all(loadPromises).then(() => {
            this.init();
        });
    }

    init() {
        this.resize();
        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener("resize", () => this.resize());

        this.container.addEventListener("mousedown", (event) => {
            this.if_movable = true;
            this.mouse_x = event.clientX;
            this.mouse_y = event.clientY;
        });

        this.container.addEventListener("mouseup", () => {
            this.if_movable = false;
        });

        this.container.addEventListener("mouseleave", () => {
            this.if_movable = false;
        });

        this.container.addEventListener("mousemove", (event) => {
            this.move(event.clientX, event.clientY);
        });

        this.container.addEventListener("click", (event) => {
            const photoDiv = event.target.closest('.photos_line_photo');
            if (photoDiv) {
                const img = photoDiv.querySelector('img');
                this.openModal(img.src);
            }
        });
    }

    resize() {
        const imgs = [...document.querySelectorAll(".photos_line_photo")];
        this.updateDimensions(imgs);
        this.resetImagesPosition(imgs);
        this.updateImageData(imgs);
    }

    updateDimensions(imgs) {
        this.container_width = this.container.offsetWidth;
        this.container_height = this.container.offsetHeight;
        this.photo_width = imgs[0].offsetWidth;
        this.photo_height = imgs[0].offsetHeight;
        this.scale_nums = document.body.offsetWidth / this.standard_width;
        this.container.style.transform = `scale(${this.scale_nums})`;
    }

    resetImagesPosition(imgs) {
        gsap.to(imgs, {
            transform: `translate(0,0)`,
            duration: 0,
            ease: 'power4.out'
        });
    }

    updateImageData(imgs) {
        this.img_data = imgs.map(img => ({
            node: img,
            x: img.offsetLeft,
            y: img.offsetTop,
            mov_x: 0,
            mov_y: 0,
            ani: 0
        }));
    }

    move(x, y) {
        if (!this.if_movable) return;

        const distance_x = (x - this.mouse_x) / this.scale_nums;
        const distance_y = (y - this.mouse_y) / this.scale_nums;

        this.img_data.forEach(img => this.updateImagePosition(img, distance_x, distance_y));

        this.mouse_x = x;
        this.mouse_y = y;
    }

    updateImagePosition(img, distance_x, distance_y) {
        let duration = 1;

        img.mov_x += distance_x;
        img.mov_y += distance_y;

        // Handle horizontal wrapping
        if (img.x + img.mov_x > this.container_width) {
            img.mov_x -= this.container_width;
            duration = 0;
        }
        if (img.x + img.mov_x < -this.photo_width) {
            img.mov_x += this.container_width;
            duration = 0;
        }

        // Handle vertical wrapping
        if (img.y + img.mov_y > this.container_height) {
            img.mov_y -= this.container_height;
            duration = 0;
        }
        if (img.y + img.mov_y < -this.photo_height) {
            img.mov_y += this.container_height;
            duration = 0;
        }

        if (img.ani) img.ani.kill();

        img.ani = gsap.to(img.node, {
            transform: `translate(${img.mov_x}px,${img.mov_y}px)`,
            duration: duration,
            ease: 'power4.out'
        });
    }

    createModal() {
        // Create modal container
        this.modal = document.createElement('div');
        this.modal.className = 'photo-modal';
        this.modal.style.display = 'none';

        // Create modal image
        this.modalImg = document.createElement('img');
        this.modalImg.className = 'modal-content';

        // Create close button
        this.closeBtn = document.createElement('span');
        this.closeBtn.className = 'modal-close';
        this.closeBtn.innerHTML = '&times;';

        this.modal.appendChild(this.modalImg);
        this.modal.appendChild(this.closeBtn);
        document.body.appendChild(this.modal);

        // Add close events
        this.closeBtn.onclick = () => this.closeModal();
        this.modal.onclick = (e) => {
            if (e.target === this.modal) this.closeModal();
        };
    }

    openModal(imgSrc) {
        this.modal.style.display = 'flex';
        this.modalImg.src = imgSrc;
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Example usage:
const imageUrls = [
    "https://pic.axi404.top/1.9rjhqwq0nd.webp",
    "https://pic.axi404.top/Lolita.67xjfb7fhn.webp",
    "https://pic.axi404.top/cover.5fkimf6u7r.webp",
    "https://pic.axi404.top/09.54xot9rm1v.webp",
    "https://pic.axi404.top/1.13lr4lb3hn.webp",
    "https://pic.axi404.top/08.7p3j5wrknt.webp",
    "https://pic.axi404.top/07.8ad6s7m0y0.webp",
    "https://pic.axi404.top/3.73tx9bkp6r.webp",
    "https://pic.axi404.top/2.3yejhm2kef.webp",
    "https://pic.axi404.top/cf9366221eead347d2302847efe058e.1hs6t514b2.webp",
    "https://pic.axi404.top/06.6pnfsqoth3.webp",
    "https://pic.axi404.top/04.1seyywb1ni.webp",
    "https://pic.axi404.top/d3c01538891f9d476028edbac9e5e88.2yybuvxmgu.webp",
    "https://pic.axi404.top/4.9nzrlykntj.webp",
    "https://pic.axi404.top/05.6ik7xb2o16.webp",
    "https://pic.axi404.top/03.45m1pkrgu.webp",
    "https://pic.axi404.top/2.67xftvb0q6.webp",
    "https://pic.axi404.top/02.5j44k4zwub.webp",
    "https://pic.axi404.top/d9d522b3e111531125cfe492d8d0d31.2obi1qe8fn.webp",
    "https://pic.axi404.top/5.73tx9bkp60.webp",
    "https://pic.axi404.top/48759bdc49189f95f1f79add6776eff.54xqgnplfp.webp",
    "https://pic.axi404.top/01.2h88iwykmw.webp",
    "https://pic.axi404.top/e15bf19e4bc75c97d586622e701563a.5q7e2yrsfq.webp",
];

const photobox = new PhotoBox(imageUrls); 