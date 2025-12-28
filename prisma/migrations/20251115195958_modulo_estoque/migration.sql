-- CreateTable
CREATE TABLE `categorias_estoque` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `categorias_estoque_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `insumos` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NULL,
    `unidadeMedida` VARCHAR(191) NOT NULL DEFAULT 'UN',
    `estoqueAtual` DOUBLE NOT NULL DEFAULT 0,
    `estoqueMinimo` DOUBLE NOT NULL DEFAULT 0,
    `categoriaId` VARCHAR(191) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `insumos_categoriaId_idx`(`categoriaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `insumos` ADD CONSTRAINT `insumos_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `categorias_estoque`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
