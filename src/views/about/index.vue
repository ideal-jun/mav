<script setup lang="ts">
import { $t } from '@/locales';
import pkg from '~/package.json';

interface PkgVersionInfo {
  name: string;
  version: string;
}

const { version, dependencies, devDependencies } = pkg;

function transformVersionData([$name, $version]: [string, string]): PkgVersionInfo {
  return { name: $name, version: $version };
}

const runtimeDependencies = Object.entries(dependencies).map(transformVersionData);
const developmentDependencies = Object.entries(devDependencies).map(transformVersionData);

const projectInfo = [
  { label: $t('page.about.projectInfo.version'), value: version, chip: true },
  { label: $t('page.about.projectInfo.latestBuildTime'), value: BUILD_TIME, chip: true }
];

const projectLinks = [
  { label: $t('page.about.projectInfo.githubLink'), href: pkg.homepage },
  { label: $t('page.about.projectInfo.previewLink'), href: pkg.website }
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <VCard class="card-wrapper">
      <VCardTitle>{{ $t('page.about.title') }}</VCardTitle>
      <VCardText>
        <p>{{ $t('page.about.introduction') }}</p>
      </VCardText>
    </VCard>

    <VCard class="card-wrapper">
      <VCardTitle>{{ $t('page.about.projectInfo.title') }}</VCardTitle>
      <VCardText>
        <div class="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
          <div
            v-for="item in projectInfo"
            :key="item.label"
            class="flex items-start gap-3 border-b border-gray-200 py-3"
          >
            <span class="w-36 shrink-0 text-medium-emphasis">{{ item.label }}</span>
            <VChip v-if="item.chip" color="primary" size="small" label>{{ item.value }}</VChip>
            <span v-else>{{ item.value }}</span>
          </div>
          <div
            v-for="item in projectLinks"
            :key="item.label"
            class="flex items-start gap-3 border-b border-gray-200 py-3"
          >
            <span class="w-36 shrink-0 text-medium-emphasis">{{ item.label }}</span>
            <a class="text-primary no-underline" :href="item.href" target="_blank" rel="noopener noreferrer">
              {{ item.label }}
            </a>
          </div>
        </div>
      </VCardText>
    </VCard>

    <VCard class="card-wrapper">
      <VCardTitle>{{ $t('page.about.prdDep') }}</VCardTitle>
      <VCardText>
        <div class="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
          <div
            v-for="item in runtimeDependencies"
            :key="item.name"
            class="flex items-start gap-3 border-b border-gray-200 py-2"
          >
            <span class="w-56 shrink-0 truncate text-medium-emphasis">{{ item.name }}</span>
            <span>{{ item.version }}</span>
          </div>
        </div>
      </VCardText>
    </VCard>

    <VCard class="card-wrapper">
      <VCardTitle>{{ $t('page.about.devDep') }}</VCardTitle>
      <VCardText>
        <div class="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
          <div
            v-for="item in developmentDependencies"
            :key="item.name"
            class="flex items-start gap-3 border-b border-gray-200 py-2"
          >
            <span class="w-56 shrink-0 truncate text-medium-emphasis">{{ item.name }}</span>
            <span>{{ item.version }}</span>
          </div>
        </div>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped></style>
