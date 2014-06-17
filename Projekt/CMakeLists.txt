project(Projekt)
cmake_minimum_required(VERSION 2.8)

set( MY_SRCS external/SFML/include/SFML/Window.hpp external/SFML/include/SFML/OpenGL.hpp external/SFML/include/SFML/Graphics.hpp main.cpp
)

add_executable(${PROJECT_NAME} ${MY_SRCS})

find_package(OpenGL REQUIRED)
include_directories(${OpenGL_INCLUDE_DIRS})
link_directories(${OpenGL_LIBRARY_DIRS})
add_definitions(${OpenGL_DEFINITIONS})

# configure compiler for c++11 etc.
if( "${CMAKE_CXX_COMPILER_ID}" MATCHES "GNU" )
    set( CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -pedantic -std=c++11" )
endif()

# wrap the main function for those OSes
if( ${CMAKE_SYSTEM_NAME} MATCHES "^Windows$|^Android$|^Darwin$" )
    set( NEED_MAIN_WRAP TRUE )
endif()

option( USE_SYSTEM_SFML "Use system SFML installation" OFF )
if( NOT USE_SYSTEM_SFML )
    set( BUILD_SHARED_LIBS FALSE CACHE BOOL "Build shared libraries" )
    add_subdirectory( "external/SFML" )
    include_directories( "${CMAKE_SOURCE_DIR}/external/SFML/include" )
    target_link_libraries( ${PROJECT_NAME} sfml-system sfml-window sfml-graphics sfml-audio ${OPENGL_LIBRARIES} ${GLUT_LIBRARY} )
    if( NEED_MAIN_WRAP )
        target_link_libraries( ${PROJECT_NAME} sfml-main )
    endif()
else()
    if( NEED_MAIN_WRAP )
        find_package( SFML 2 REQUIRED system window graphics network audio main )
    else()
        find_package( SFML 2 REQUIRED system window graphics network audio )
    endif()
    include_directories( ${SFML_INCLUDE_DIR} )
    target_link_libraries( ${PROJECT_NAME} ${SFML_LIBRARIES} ${OPENGL_LIBRARIES} ${GLUT_LIBRARY} )
endif()
