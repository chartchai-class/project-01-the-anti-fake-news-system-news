<script setup>
import profile1 from '@/assets/images/profile1.jpg'
import profile2 from '@/assets/images/profile2.jpg'
import profile3 from '@/assets/images/profile3.jpg'
</script>

<template>
  <div class="p-8 max-w-5xl mx-auto">
    <!-- Header -->
    <h1 class="text-3xl font-bold mb-8 text-center">About Us</h1>

    <!-- Cards container -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

      <!-- Card 1 -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden flex flex-col items-center text-center">
        <div class="w-full aspect-square overflow-hidden">
          <img :src="profile1" alt="Profile 1" class="w-full h-full object-cover" />
        </div>
        <div class="p-4">
          <h2 class="text-xl font-semibold mb-1">Htet Oo Thu</h2>
          <p class="text-gray-600 mb-1">Student ID: 662115504</p>
          <p class="text-gray-600">Faculty: Software Engineering</p>
        </div>
      </div>

      <!-- Card 2 -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden flex flex-col items-center text-center">
        <div class="w-full aspect-square overflow-hidden">
          <img :src="profile2" alt="Profile 2" class="w-full h-full object-cover" />
        </div>
        <div class="p-4">
          <h2 class="text-xl font-semibold mb-1">Kaung Khant San</h2>
          <p class="text-gray-600 mb-1">Student ID: 662115507</p>
          <p class="text-gray-600">Faculty: Software Engineering</p>
        </div>
      </div>

      <!-- Card 3 -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden flex flex-col items-center text-center">
        <div class="w-full aspect-square overflow-hidden">
          <img :src="profile3" alt="Profile 3" class="w-full h-full object-cover" />
        </div>
        <div class="p-4">
          <h2 class="text-xl font-semibold mb-1">Saw Zan Nyan</h2>
          <p class="text-gray-600 mb-1">Student ID: 662115514</p>
          <p class="text-gray-600">Faculty: Software Engineering</p>
        </div>
      </div>

    </div>
  </div>
</template>


