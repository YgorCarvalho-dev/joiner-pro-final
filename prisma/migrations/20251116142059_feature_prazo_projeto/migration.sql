-- AlterTable
ALTER TABLE `projeto` ADD COLUMN `dataInicioProducao` DATETIME(3) NULL,
    ADD COLUMN `prazoEmDias` INTEGER NOT NULL DEFAULT 30;

-- CreateTable
CREATE TABLE `insumos_do_projeto` (
    `id` VARCHAR(191) NOT NULL,
    `projetoId` VARCHAR(191) NOT NULL,
    `insumoId` VARCHAR(191) NOT NULL,
    `quantidadeUsada` DOUBLE NOT NULL DEFAULT 1,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `insumos_do_projeto_projetoId_idx`(`projetoId`),
    INDEX `insumos_do_projeto_insumoId_idx`(`insumoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `insumos_do_projeto` ADD CONSTRAINT `insumos_do_projeto_projetoId_fkey` FOREIGN KEY (`projetoId`) REFERENCES `Projeto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `insumos_do_projeto` ADD CONSTRAINT `insumos_do_projeto_insumoId_fkey` FOREIGN KEY (`insumoId`) REFERENCES `insumos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
