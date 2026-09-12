export interface SoftwareSession {
  sessionNumber: number;
  title: string;
  description?: string;
}

export interface SoftwareItem {
  id: string;
  name: string;
  category: '2D & Graphic Design' | '3D Animation & Modeling' | 'VFX & Compositing' | 'UI / UX & Web' | 'Audio & Video Editing' | 'Generative AI' | 'Game Design & Real-Time';
  totalSessions: number;
  sessions: SoftwareSession[];
  description?: string;
}

export const SOFTWARE_DATABASE: SoftwareItem[] = [
  // === 1. 2D & GRAPHIC DESIGN ===
  {
    id: 'ps',
    name: 'Photoshop - PS',
    category: '2D & Graphic Design',
    totalSessions: 16,
    description: 'Industry-standard raster graphics and image editing software.',
    sessions: [
      { sessionNumber: 1, title: 'Introduction and Interface of Photoshop' },
      { sessionNumber: 2, title: 'Working with selection tools and layers' },
      { sessionNumber: 3, title: 'Typography' },
      { sessionNumber: 4, title: 'Working with Brushes' },
      { sessionNumber: 5, title: 'Image Retouching' },
      { sessionNumber: 6, title: 'Restoration / Create clean plate for VFX' },
      { sessionNumber: 7, title: 'Working with Colors' },
      { sessionNumber: 8, title: 'Gradient and Blending Modes' },
      { sessionNumber: 9, title: 'Color Channels and Masking' },
      { sessionNumber: 10, title: 'Color Correction' },
      { sessionNumber: 11, title: 'Working with Vector (Pen Tool, Paths, Shapes)' },
      { sessionNumber: 12, title: 'Logo Creation' },
      { sessionNumber: 13, title: 'Filters Effects - 1' },
      { sessionNumber: 14, title: 'Filters Effects - 2' },
      { sessionNumber: 15, title: 'Matte Painting' },
      { sessionNumber: 16, title: 'Digital Painting' },
    ]
  },
  {
    id: 'ai-id',
    name: 'Illustrator & InDesign',
    category: '2D & Graphic Design',
    totalSessions: 14,
    description: 'Vector graphics and publication layout publishing suite.',
    sessions: [
      { sessionNumber: 1, title: 'Illustrator Workspace, Artboards & Vector Fundamentals' },
      { sessionNumber: 2, title: 'Pen Tool, Anchor Points & Shape Builder Tools' },
      { sessionNumber: 3, title: 'Color Theory, Swatches, Gradients & Patterns' },
      { sessionNumber: 4, title: 'Advanced Typography & Logo Identity Design' },
      { sessionNumber: 5, title: 'Vector Illustration, Isometric Art & Perspective Grid' },
      { sessionNumber: 6, title: 'Live Trace, Vectorizing Artwork & Appearance Panel' },
      { sessionNumber: 7, title: 'Brushes, Symbols & Vector Effects' },
      { sessionNumber: 8, title: 'InDesign Workspace, Document Setup & Master Pages' },
      { sessionNumber: 9, title: 'Text Formatting, Paragraph Styles & Character Styles' },
      { sessionNumber: 10, title: 'Working with Images, Frames & Text Wrap' },
      { sessionNumber: 11, title: 'Multi-Page Magazine & Brochure Layout Design' },
      { sessionNumber: 12, title: 'Tables, Table of Contents & Interactive Elements' },
      { sessionNumber: 13, title: 'Pre-flighting, Packaging & Print Production Prep' },
      { sessionNumber: 14, title: 'Digital Publishing, Interactive PDFs & Portfolio Book' },
    ]
  },
  {
    id: 'lr',
    name: 'Adobe Lightroom',
    category: '2D & Graphic Design',
    totalSessions: 6,
    description: 'Professional photo grading and catalog management.',
    sessions: [
      { sessionNumber: 1, title: 'Library Module, Catalog Management & RAW Import' },
      { sessionNumber: 2, title: 'Develop Module: Exposure, Contrast, Highlights & Shadows' },
      { sessionNumber: 3, title: 'Color Grading, HSL Curves & Split Toning' },
      { sessionNumber: 4, title: 'Masking, Radial / Linear Filters & Subject Detection' },
      { sessionNumber: 5, title: 'Lens Corrections, Detail, Sharpening & Noise Reduction' },
      { sessionNumber: 6, title: 'Batch Processing, Watermarking & Print / Web Export' },
    ]
  },
  {
    id: 'animate-cc',
    name: 'Adobe Animate CC',
    category: '2D & Graphic Design',
    totalSessions: 10,
    description: '2D vector animation, puppeting, and interactive multimedia.',
    sessions: [
      { sessionNumber: 1, title: 'Animate Workspace, Stage, Timeline & Vector Drawing Tools' },
      { sessionNumber: 2, title: 'Symbols: Movie Clips, Buttons & Graphic Symbols' },
      { sessionNumber: 3, title: 'Frame-by-Frame 2D Classical Animation' },
      { sessionNumber: 4, title: 'Classic Tweens, Motion Tweens & Shape Tweens' },
      { sessionNumber: 5, title: '2D Character Rigging using Bone Tool & Layer Parenting' },
      { sessionNumber: 6, title: 'Lip Syncing, Audio Integration & Facial Expressions' },
      { sessionNumber: 7, title: '2D Character Walk Cycle & Run Cycle Animation' },
      { sessionNumber: 8, title: 'Camera Tool, Depth & Multiplane Parallax Effects' },
      { sessionNumber: 9, title: 'Interactive Buttons & Basic HTML5 Canvas Scripting' },
      { sessionNumber: 10, title: 'Exporting 2D Animation for Broadcast & Web Media' },
    ]
  },

  // === 2. AUDIO & VIDEO EDITING ===
  {
    id: 'pr',
    name: 'Premiere - PR',
    category: 'Audio & Video Editing',
    totalSessions: 8,
    description: 'Industry standard non-linear video editing for film and broadcast.',
    sessions: [
      { sessionNumber: 1, title: 'Broadcasting standard and types of editing' },
      { sessionNumber: 2, title: 'New project setting, Importing footage, Lineup on timeline' },
      { sessionNumber: 3, title: 'Adding Transition, Refining edit, Trimming, using Editing tools' },
      { sessionNumber: 4, title: 'Video Effects' },
      { sessionNumber: 5, title: 'Color correction' },
      { sessionNumber: 6, title: 'Introduction to Audition workspace' },
      { sessionNumber: 7, title: 'Recording and editing sound' },
      { sessionNumber: 8, title: 'Cleaning and restoring audio' },
    ]
  },
  {
    id: 'audition',
    name: 'Adobe Audition',
    category: 'Audio & Video Editing',
    totalSessions: 8,
    description: 'Audio workstation for sound design, podcasting and mixing.',
    sessions: [
      { sessionNumber: 1, title: 'Introduction to Audition Workspace & Waveform Editor' },
      { sessionNumber: 2, title: 'Audio Recording, Sample Rates & Bit Depth Setup' },
      { sessionNumber: 3, title: 'Cleaning & Restoring Audio (Noise Reduction, De-hum)' },
      { sessionNumber: 4, title: 'Multitrack Session Setup & Dialogue Editing' },
      { sessionNumber: 5, title: 'Equalization, Compression & Dynamic Processing' },
      { sessionNumber: 6, title: 'Reverb, Delay & Modulation Sound Effects' },
      { sessionNumber: 7, title: 'Foley, Sound Design & Background Score Mixing' },
      { sessionNumber: 8, title: 'Mastering, Loudness Standards (LUFS) & Audio Export' },
    ]
  },
  {
    id: 'davinci',
    name: 'DaVinci Resolve',
    category: 'Audio & Video Editing',
    totalSessions: 10,
    description: 'High-end color grading, editing, Fusion VFX and Fairlight audio.',
    sessions: [
      { sessionNumber: 1, title: 'DaVinci Resolve UI, Media Pool & Cut / Edit Pages' },
      { sessionNumber: 2, title: 'Advanced Timeline Editing, Ripple, Roll & Slip Edits' },
      { sessionNumber: 3, title: 'Color Page Overview: Scopes, Primary Color Wheels & Curves' },
      { sessionNumber: 4, title: 'Secondaries: HSL Qualifiers, Power Windows & Tracking' },
      { sessionNumber: 5, title: 'Color Space Transform, ACES Workflow & RAW Grading' },
      { sessionNumber: 6, title: 'Look Development, Film Emulation & Cinematic LUTs' },
      { sessionNumber: 7, title: 'Fusion Page: Node Graph Compositing Basics' },
      { sessionNumber: 8, title: 'Fusion Tracking, Keying & Title Animations' },
      { sessionNumber: 9, title: 'Fairlight Audio Mixing & Dialogue Sweetening' },
      { sessionNumber: 10, title: 'Deliver Page: Master Rendering for Theater & OTT' },
    ]
  },

  // === 3. 3D ANIMATION & MODELING (MAYA) ===
  {
    id: 'maya-mod',
    name: 'Maya - 3D Modeling',
    category: '3D Animation & Modeling',
    totalSessions: 12,
    description: 'Hard surface and organic 3D modeling fundamentals.',
    sessions: [
      { sessionNumber: 1, title: 'Introduction to Maya-Interface & basic primitives' },
      { sessionNumber: 2, title: 'NURBS Curves & Surfaces' },
      { sessionNumber: 3, title: 'NURBS - Creating Inorganic object' },
      { sessionNumber: 4, title: 'Introduction to Poly Tools-creating basic object' },
      { sessionNumber: 5, title: 'Introduction to Poly Tools-Understanding relative proportions' },
      { sessionNumber: 6, title: 'Inorganic Modeling - BG blocking' },
      { sessionNumber: 7, title: 'Inorganic Modeling - BG detailing of elements' },
      { sessionNumber: 8, title: 'Character Modeling - Blocking whole body' },
      { sessionNumber: 9, title: 'Character Modeling - Body detailing' },
      { sessionNumber: 10, title: 'Character Modeling - Face detailing' },
      { sessionNumber: 11, title: 'Character Modeling - Clothing and Props detailing' },
      { sessionNumber: 12, title: 'Character Modeling - facial Expressions (eye blink,angry,sad,smile)' },
    ]
  },
  {
    id: 'maya-tex',
    name: 'Maya - Texturing',
    category: '3D Animation & Modeling',
    totalSessions: 6,
    description: 'UV unwrapping, shading networks, and material authoring.',
    sessions: [
      { sessionNumber: 1, title: 'Introduction to Shading & Texturing -Blinn, Phong, Lambert' },
      { sessionNumber: 2, title: 'Working With 2D and 3D Texture UV Mapping' },
      { sessionNumber: 3, title: 'Working with Reflection & Refraction & Hypershade utilities' },
      { sessionNumber: 4, title: 'Layer Shader, Layer texture & Utilities(Surface luminance & Switch)' },
      { sessionNumber: 5, title: 'Introduction to UV maping & Unwrap' },
      { sessionNumber: 6, title: 'Unwrapping a Character' },
    ]
  },
  {
    id: 'maya-lit',
    name: 'Maya - Lighting',
    category: '3D Animation & Modeling',
    totalSessions: 6,
    description: 'Cinematic three-point lighting, exterior daylighting, and interior passes.',
    sessions: [
      { sessionNumber: 1, title: 'Introduction to Standard Lights and Shadows' },
      { sessionNumber: 2, title: 'Three-Point Lighting' },
      { sessionNumber: 3, title: 'Day Lighting-Exterior' },
      { sessionNumber: 4, title: 'Night Lighting-Interior' },
      { sessionNumber: 5, title: 'Day Lighting Passes' },
      { sessionNumber: 6, title: 'Night Lighting Passes' },
    ]
  },
  {
    id: 'maya-ren',
    name: 'Maya - Rendering',
    category: '3D Animation & Modeling',
    totalSessions: 6,
    description: 'Arnold photorealistic shaders, AOVs, SSS, and CG live integration.',
    sessions: [
      { sessionNumber: 1, title: 'Introduction to Arnold and Arnold Shaders' },
      { sessionNumber: 2, title: 'Introduction to AOVs and Image-based Lighting' },
      { sessionNumber: 3, title: 'Exterior Scene with Arnold AOVs (Day and Night scene)' },
      { sessionNumber: 4, title: 'Interior Scene with Arnold AOVs (Day and Night Scene)' },
      { sessionNumber: 5, title: 'CG Live Integration with Arnold AOVs' },
      { sessionNumber: 6, title: 'SSS (Sub surface scatter) and Hair Shader' },
    ]
  },
  {
    id: 'maya-rig',
    name: 'Maya - Rigging',
    category: '3D Animation & Modeling',
    totalSessions: 10,
    description: 'Skeleton setups, IK/FK controls, skinning, deformers, and facial rigging.',
    sessions: [
      { sessionNumber: 1, title: 'Introduction to rigging & Working with Connections-1: Grouping, Parenting, Connection Editor' },
      { sessionNumber: 2, title: 'Working with Connections-2:Constraints, SDK' },
      { sessionNumber: 3, title: 'Mechanical Rig (Usage of constraints, utilities, SDK)' },
      { sessionNumber: 4, title: 'Deformers-Lattice,Wrap,Cluster' },
      { sessionNumber: 5, title: 'Deformers-Sculpt,Jiggle,Wire' },
      { sessionNumber: 6, title: 'Introduction to Bones & Biped bone setup' },
      { sessionNumber: 7, title: 'IK & FK controllers (custom attributes,)' },
      { sessionNumber: 8, title: 'Introduction to skinning' },
      { sessionNumber: 9, title: 'Advance skinning' },
      { sessionNumber: 10, title: 'Facial Rigging' },
    ]
  },
  {
    id: 'maya-ani',
    name: 'Maya - Animation',
    category: '3D Animation & Modeling',
    totalSessions: 12,
    description: 'Classical principles of animation, walk cycles, weight, and acting.',
    sessions: [
      { sessionNumber: 1, title: 'Introduction to Timeline & key frame animation' },
      { sessionNumber: 2, title: 'Bouncing ball ( Working with Dope Sheet and curve editor)' },
      { sessionNumber: 3, title: 'Secondary Action and overlapping using Pendulum' },
      { sessionNumber: 4, title: 'Wave Principle' },
      { sessionNumber: 5, title: 'Working with Weights: Sack Exercise' },
      { sessionNumber: 6, title: 'Creating strong poses' },
      { sessionNumber: 7, title: 'Pose to pose & straight ahead animation' },
      { sessionNumber: 8, title: 'Walk Cycle - Lower Body & Upper Body' },
      { sessionNumber: 9, title: 'Understanding Weights: Push' },
      { sessionNumber: 10, title: 'Understanding Weights: Pull' },
      { sessionNumber: 11, title: 'Animation using props & Motion Path(constraints)' },
      { sessionNumber: 12, title: 'Introduction to Facial Animation' },
    ]
  },
  {
    id: 'maya-dyn',
    name: 'Maya - Dynamics',
    category: '3D Animation & Modeling',
    totalSessions: 10,
    description: 'nParticles, fluids, rigid bodies, cloth, and Bifrost simulation.',
    sessions: [
      { sessionNumber: 1, title: 'Introduction to Particle Dynamics - nParticle type & Fields' },
      { sessionNumber: 2, title: 'nParticle type - Collision event editor, Rendering Process' },
      { sessionNumber: 3, title: 'Working With Shape Instance & Per Particle Attribute' },
      { sessionNumber: 4, title: 'Introduction to Soft Bodies- working with goals' },
      { sessionNumber: 5, title: 'Introduction to Rigid Body and Constraint' },
      { sessionNumber: 6, title: 'Introduction to Fluid - 2D & 3D Container' },
      { sessionNumber: 7, title: 'Introduction to Character Cloth & Constraint' },
      { sessionNumber: 8, title: 'Introduction to Bifrost Workspace' },
      { sessionNumber: 9, title: 'Liquid Simulation with Bifrost' },
      { sessionNumber: 10, title: 'High Viscosity Fluids with Bifrost' },
    ]
  },

  // === 4. 3D STUDIO MAX ===
  {
    id: 'max-mod',
    name: 'Max - Modeling',
    category: '3D Animation & Modeling',
    totalSessions: 14,
    description: '3ds Max spline, modifier, poly modeling, and morph targets.',
    sessions: [
      { sessionNumber: 1, title: 'Introduction to 3D Studio Max(interface & tools)' },
      { sessionNumber: 2, title: 'working with primitive geometry' },
      { sessionNumber: 3, title: 'Working with spline and modifiers-Extrude, Lathe, Bevel profile' },
      { sessionNumber: 4, title: 'Working with Modifiers-Bend,Taper,Twist,Noise,Ripple,Wave' },
      { sessionNumber: 5, title: 'Modeling Operations-Pro Boolean,Loft' },
      { sessionNumber: 6, title: 'Introduction to Poly Tools- exploring tools' },
      { sessionNumber: 7, title: 'Introduction to Poly Tools- creating an object' },
      { sessionNumber: 8, title: 'Inorganic Modeling - BG blocking' },
      { sessionNumber: 9, title: 'Inorganic Modeling - BG detailing of elements' },
      { sessionNumber: 10, title: 'Character Modeling - Blocking whole body' },
      { sessionNumber: 11, title: 'Character Modeling - Body detailing' },
      { sessionNumber: 12, title: 'Character Modeling - Face detailing' },
      { sessionNumber: 13, title: 'Character Modeling - Clothing and Props detailing' },
      { sessionNumber: 14, title: 'Character Modeling - Creating Morph targets' },
    ]
  },
  {
    id: 'max-tex',
    name: 'Max - Texturing',
    category: '3D Animation & Modeling',
    totalSessions: 12,
    description: '3ds Max material editor, UV mapping, Multi-Object materials.',
    sessions: [
      { sessionNumber: 1, title: 'Introduction to Texturing & material editor' },
      { sessionNumber: 2, title: 'Working with Procedural Mapping' },
      { sessionNumber: 3, title: 'Basics of UV Mapping' },
      { sessionNumber: 4, title: 'Basics of material' },
      { sessionNumber: 5, title: 'Ray trace: Materials and Maps' },
      { sessionNumber: 6, title: 'Advanced Material: Multi-Object with ink & paint' },
      { sessionNumber: 7, title: 'Adv. Material: Blend, Composite, Matte shadow, Double sided' },
      { sessionNumber: 8, title: 'Introduction to UV Unwrap (BG)' },
      { sessionNumber: 9, title: 'Texturing a Background (BG)' },
      { sessionNumber: 10, title: 'Unwrapping a Character: Planar / Pelt Mapping' },
      { sessionNumber: 11, title: 'Texturing a character (Face & Body)' },
      { sessionNumber: 12, title: 'Texturing a character (Clothing & Accessories )' },
    ]
  },
  {
    id: 'max-lit',
    name: 'Max - Lighting',
    category: '3D Animation & Modeling',
    totalSessions: 12,
    description: 'Standard, photometric, and global illumination lighting in 3ds Max.',
    sessions: [
      { sessionNumber: 1, title: 'Introduction to Standard Lights / Shadows' },
      { sessionNumber: 2, title: 'Basic 3 Point Light Setup' },
      { sessionNumber: 3, title: 'Day lighting (Exterior)' },
      { sessionNumber: 4, title: 'Night lighting (Interior)' },
      { sessionNumber: 5, title: 'Day lighting passes & night lighting passes (volume light)' },
      { sessionNumber: 6, title: 'Photometric Lights and Radiosity' },
      { sessionNumber: 7, title: 'Introduction to Mental Ray: Global Illumination' },
      { sessionNumber: 8, title: 'Mental Ray - Final Gather & IBL' },
      { sessionNumber: 9, title: 'Mental Ray Shaders Architechtural materials' },
      { sessionNumber: 10, title: 'Mental Ray - Caustic (Reflective & Refractive)' },
      { sessionNumber: 11, title: 'Mental Ray - Day Light System' },
      { sessionNumber: 12, title: 'Render to Texture' },
    ]
  },
  {
    id: 'max-rig-ani',
    name: 'Max - Rigging & Animation',
    category: '3D Animation & Modeling',
    totalSessions: 14,
    description: 'Character rigging, bone setup, skinning, cloth, hair & fur animation.',
    sessions: [
      { sessionNumber: 1, title: 'Introduction to Rigging - Child parent relationship,Constraints' },
      { sessionNumber: 2, title: 'Working with constraints' },
      { sessionNumber: 3, title: 'Wire Parameters  & Reaction Manager' },
      { sessionNumber: 4, title: 'Introduction to Bones & creating bone setup' },
      { sessionNumber: 5, title: 'IK & FK controllers- Creating custom attributes' },
      { sessionNumber: 6, title: 'Introduction to skinning-envelop editing, weight table, painting weights' },
      { sessionNumber: 7, title: 'Introduction to Timeline & key frame animation' },
      { sessionNumber: 8, title: 'Bouncing ball ( Working with Dope Sheet )' },
      { sessionNumber: 9, title: 'Pendulum Exercise ( Working with Curve Editor)' },
      { sessionNumber: 10, title: 'Creating strong poses' },
      { sessionNumber: 11, title: 'Pose to pose & straight ahead animation (Chopping a wood)' },
      { sessionNumber: 12, title: 'Walk Cycle' },
      { sessionNumber: 13, title: 'Intro to Cloth (Cloth modifier)' },
      { sessionNumber: 14, title: 'Introduction to Hair  & Fur' },
    ]
  },

  // === 5. VFX & COMPOSITING ===
  {
    id: 'afx',
    name: 'After Effects - AFX',
    category: 'VFX & Compositing',
    totalSessions: 14,
    description: 'Motion design, rotoscopy, keying, camera tracking and particles.',
    sessions: [
      { sessionNumber: 1, title: 'Interface and Introduction to After Effects, New Composition & Basic Animation' },
      { sessionNumber: 2, title: 'Advance Keyframe Animation & Graph Editor' },
      { sessionNumber: 3, title: 'Text Animation' },
      { sessionNumber: 4, title: 'Shape Layer Animation' },
      { sessionNumber: 5, title: 'Motion Graphics' },
      { sessionNumber: 6, title: '1&2 Point Tracking' },
      { sessionNumber: 7, title: '4-Point Tracking & Stablizing' },
      { sessionNumber: 8, title: 'Rotoscopy' },
      { sessionNumber: 9, title: 'Sequence Paint - Wire Removal' },
      { sessionNumber: 10, title: 'Keying' },
      { sessionNumber: 11, title: 'Color Correction' },
      { sessionNumber: 12, title: '3D Interface and 3D Camera Tracking' },
      { sessionNumber: 13, title: 'Displacement Map' },
      { sessionNumber: 14, title: 'AFX Particles' },
    ]
  },
  {
    id: 'nuke',
    name: 'Nuke',
    category: 'VFX & Compositing',
    totalSessions: 16,
    description: 'High-end node-based compositing for feature film visual effects.',
    sessions: [
      { sessionNumber: 1, title: 'Intro to Nuke and GUI' },
      { sessionNumber: 2, title: 'Basic Nodes (Merge, Transform, Reformat, Read & Write)' },
      { sessionNumber: 3, title: 'Introduction to Roto & Paint Node' },
      { sessionNumber: 4, title: 'Motion Tracking 1' },
      { sessionNumber: 5, title: 'Motion Tracking 2' },
      { sessionNumber: 6, title: 'Rotoscopy' },
      { sessionNumber: 7, title: 'Paint 1' },
      { sessionNumber: 8, title: 'Paint 2' },
      { sessionNumber: 9, title: 'Keying-1' },
      { sessionNumber: 10, title: 'Keying-2' },
      { sessionNumber: 11, title: 'Color correction nodes' },
      { sessionNumber: 12, title: '3D Camera tracking & Matchmove' },
      { sessionNumber: 13, title: '3D Matte Paint' },
      { sessionNumber: 14, title: 'Set extension using point cloud data and camera projection' },
      { sessionNumber: 15, title: 'Working with CG render passes - openEXR' },
      { sessionNumber: 16, title: 'CG live action integration' },
    ]
  },
  {
    id: 'silhouette',
    name: 'Silhouette',
    category: 'VFX & Compositing',
    totalSessions: 5,
    description: 'Specialized rotoscopy, stereo roto, and hair paint.',
    sessions: [
      { sessionNumber: 1, title: 'Introduction to Silhouette and roto static and moving shape' },
      { sessionNumber: 2, title: 'Roto camera Jerky/Jitter shot' },
      { sessionNumber: 3, title: 'Hair Roto' },
      { sessionNumber: 4, title: 'Motion Blur Roto' },
      { sessionNumber: 5, title: 'Stereo Roto' },
    ]
  },
  {
    id: 'mocha',
    name: 'Mocha',
    category: 'VFX & Compositing',
    totalSessions: 4,
    description: 'Planar tracking, stabilization, rotoscoping and camera solve.',
    sessions: [
      { sessionNumber: 1, title: 'Introduction to Planar tracking & Mocha Interface' },
      { sessionNumber: 2, title: 'Tracking & stabillize technique' },
      { sessionNumber: 3, title: 'Rotoscopy workflow' },
      { sessionNumber: 4, title: 'Export shape and tracking data into Compositing softwares' },
    ]
  },
  {
    id: '3dequalizer',
    name: '3D Equalizer',
    category: 'VFX & Compositing',
    totalSessions: 8,
    description: 'Industry-standard matchmoving and camera tracking software.',
    sessions: [
      { sessionNumber: 1, title: '3D Equalizer Interface, Project Setup & Footage Calibration' },
      { sessionNumber: 2, title: 'Point Tracking: Manual 2D Point Feature Tracking' },
      { sessionNumber: 3, title: 'Lens Distortion, Grid Calibration & Anamorphic Solving' },
      { sessionNumber: 4, title: 'Camera Solving, Error Curves & Deviation Analysis' },
      { sessionNumber: 5, title: 'Object Tracking, Moving Car & Prop Solves' },
      { sessionNumber: 6, title: 'Survey Data Integration, Point Clouds & 3D Geometry Lineup' },
      { sessionNumber: 7, title: 'Exporting Solves to Maya, Nuke & Blender' },
      { sessionNumber: 8, title: 'Production Matchmove Shot Case Study' },
    ]
  },
  {
    id: 'houdini',
    name: 'Houdini FX',
    category: 'VFX & Compositing',
    totalSessions: 12,
    description: 'Procedural generation, destruction, pyro, FLIP fluids and Vellum cloth.',
    sessions: [
      { sessionNumber: 1, title: 'Houdini Node Architecture, SOPs & Procedural Modeling' },
      { sessionNumber: 2, title: 'VEX & VOPs: Attributes, Point Wrangling & Expressions' },
      { sessionNumber: 3, title: 'RBD Bullet Destruction: Voronoi Fracture & Constraints' },
      { sessionNumber: 4, title: 'DOPs Dynamics Networks & Solver Forces' },
      { sessionNumber: 5, title: 'Pyro FX: Smoke, Fire & Explosion Simulation Setup' },
      { sessionNumber: 6, title: 'Particle Systems (POPs) & Custom Force Emitters' },
      { sessionNumber: 7, title: 'FLIP Fluids: Ocean Waves, Splashes & Viscous Liquids' },
      { sessionNumber: 8, title: 'Vellum Solver: Cloth, Soft Bodies, Hair & Grains' },
      { sessionNumber: 9, title: 'Solaris & Karma: USD Staging, Materials & Lighting' },
      { sessionNumber: 10, title: 'Karma Rendering, AOV Extraction & Deep Output' },
      { sessionNumber: 11, title: 'Houdini Engine Integration with Unreal Engine' },
      { sessionNumber: 12, title: 'VFX Production Showreel Asset Finalization' },
    ]
  },

  // === 6. DIGITAL SCULPTING & TEXTURING ===
  {
    id: 'substance-painter',
    name: 'Substance 3D Painter',
    category: '3D Animation & Modeling',
    totalSessions: 8,
    description: '3D PBR texturing, smart materials, generators, and multi-channel baking.',
    sessions: [
      { sessionNumber: 1, title: 'Substance Painter UI, Mesh Import & UV Validation' },
      { sessionNumber: 2, title: 'Mesh Map Baking: Normal, Curvature, Ambient Occlusion, ID' },
      { sessionNumber: 3, title: 'PBR Material Workflow (Base Color, Roughness, Metallic, Normal)' },
      { sessionNumber: 4, title: 'Smart Materials, Smart Masks & Procedural Generators' },
      { sessionNumber: 5, title: 'Hand-Painting Details, Stencils, Projection & Symmetry' },
      { sessionNumber: 6, title: 'Hard Surface Weathering, Rust, Dirt & Edge Wear' },
      { sessionNumber: 7, title: 'Organic Skin Shading, Subsurface Scattering Maps' },
      { sessionNumber: 8, title: 'Exporting Texture Sets for Maya Arnold, Unreal & Unity' },
    ]
  },
  {
    id: 'zbrush',
    name: 'Maxon ZBrush',
    category: '3D Animation & Modeling',
    totalSessions: 10,
    description: 'Digital sculpting, anatomical blocking, Dynamesh, and ZRemesher.',
    sessions: [
      { sessionNumber: 1, title: 'ZBrush Interface, Document Setup, Tools & SubTools' },
      { sessionNumber: 2, title: 'Digital Clay Brushes: ClayTubes, Move, DamStandard, Standard' },
      { sessionNumber: 3, title: 'Dynamesh, Sculptris Pro & Organic Volume Blocking' },
      { sessionNumber: 4, title: 'Human Anatomy: Head, Facial Planes & Expressions' },
      { sessionNumber: 5, title: 'Torso, Limb Musculature & Creature Anatomy' },
      { sessionNumber: 6, title: 'Hard Surface Sculpting, ZModeler & Clip / Trim Brushes' },
      { sessionNumber: 7, title: 'ZRemesher, Polygroups & Clean Topology Flow' },
      { sessionNumber: 8, title: 'Polypainting, Alphas, Micro-Details & Pore Textures' },
      { sessionNumber: 9, title: 'Baking Displacement & Normal Maps via Multi-Map Exporter' },
      { sessionNumber: 10, title: 'Pose Master, Transpose Tool & High-Poly Portfolio Render' },
    ]
  },

  // === 7. REAL-TIME ENGINES & GAME DESIGN ===
  {
    id: 'unreal',
    name: 'Unreal Engine',
    category: 'Game Design & Real-Time',
    totalSessions: 12,
    description: 'Next-gen real-time 3D, Lumen lighting, Nanite geometry, and Blueprints.',
    sessions: [
      { sessionNumber: 1, title: 'Unreal Engine 5 Interface, Project Setup & Viewport Navigation' },
      { sessionNumber: 2, title: 'Importing Assets (FBX, Textures, Nanite Geometry Configuration)' },
      { sessionNumber: 3, title: 'PBR Material Creation, Shader Graph & Material Instances' },
      { sessionNumber: 4, title: 'Landscape Tool, Terrain Sculpting & Procedural Foliage' },
      { sessionNumber: 5, title: 'Lumen Real-Time Global Illumination, Directional & HDRI Lighting' },
      { sessionNumber: 6, title: 'Post-Process Volume, Color Grading, Exposure & Volumetric Fog' },
      { sessionNumber: 7, title: 'Niagara Particle Systems: Fire, Smoke, Magic Effects' },
      { sessionNumber: 8, title: 'Sequencer Cinematic Camera, Depth of Field & Shot Cuts' },
      { sessionNumber: 9, title: 'Visual Blueprints: Interactive Triggers, Doors & Level Events' },
      { sessionNumber: 10, title: 'MetaHuman Creator Integration & Character Performance' },
      { sessionNumber: 11, title: 'Movie Render Queue (MRQ) Photorealistic Cinematic Export' },
      { sessionNumber: 12, title: 'Game Packaging, Optimization & Performance Profiling' },
    ]
  },
  {
    id: 'unity',
    name: 'Unity Engine',
    category: 'Game Design & Real-Time',
    totalSessions: 10,
    description: 'Interactive game development, physics, C# scripting and lighting.',
    sessions: [
      { sessionNumber: 1, title: 'Unity Editor Layout, GameObjects, Components & Scenes' },
      { sessionNumber: 2, title: 'Asset Pipeline: 3D Models, Materials, Prefabs & Hierarchy' },
      { sessionNumber: 3, title: 'Universal Render Pipeline (URP) & Shader Graph Basics' },
      { sessionNumber: 4, title: 'Lighting in Unity: Baked vs Real-time Lightmaps, Reflection Probes' },
      { sessionNumber: 5, title: 'C# Scripting Fundamentals: Movement, Input & Transforms' },
      { sessionNumber: 6, title: 'Rigidbodies, Colliders, Physics Materials & Trigger Events' },
      { sessionNumber: 7, title: 'Mecanim Animation Controller, State Machines & Blend Trees' },
      { sessionNumber: 8, title: 'UI Canvas, Scoreboards, Health Bars & Event System' },
      { sessionNumber: 9, title: 'Audio Source / Listener & Particle FX' },
      { sessionNumber: 10, title: 'Building & Deploying Standalone Executable Game' },
    ]
  },

  // === 8. UI / UX & WEB ===
  {
    id: 'figma',
    name: 'Figma & UI/UX Design',
    category: 'UI / UX & Web',
    totalSessions: 10,
    description: 'Wireframing, design systems, auto-layout, interactive prototyping.',
    sessions: [
      { sessionNumber: 1, title: 'UX Fundamentals, Design Thinking, User Personas & Empathy Maps' },
      { sessionNumber: 2, title: 'Information Architecture, User Flows & Wireframing' },
      { sessionNumber: 3, title: 'Figma Interface, Frames, Vector Shapes & Typography Systems' },
      { sessionNumber: 4, title: 'Color Tokens, Styles & Responsive Layout Grids' },
      { sessionNumber: 5, title: 'Auto-Layout (Flexbox), Constraints & Responsive Components' },
      { sessionNumber: 6, title: 'Design System Creation: Components, Variants & Properties' },
      { sessionNumber: 7, title: 'High-Fidelity Mobile App & Web UI Screen Design' },
      { sessionNumber: 8, title: 'Micro-Interactions, Smart Animate & Complex Prototyping' },
      { sessionNumber: 9, title: 'Usability Testing, Heuristic Evaluation & Design Iteration' },
      { sessionNumber: 10, title: 'Developer Handoff, Spec Documentation & Case Study Presentation' },
    ]
  },

  // === 9. GENERATIVE AI SUITE ===
  {
    id: 'gen-ai',
    name: 'Generative AI & Prompt Engineering',
    category: 'Generative AI',
    totalSessions: 10,
    description: 'AI image generation, video models, voice cloning, and creative automation.',
    sessions: [
      { sessionNumber: 1, title: 'Generative AI Foundations & Prompt Engineering Masterclass' },
      { sessionNumber: 2, title: 'Midjourney & Leonardo AI: Photorealistic Imagery & Style Modifiers' },
      { sessionNumber: 3, title: 'Stable Diffusion & ComfyUI: ControlNet, Inpainting & Custom LoRAs' },
      { sessionNumber: 4, title: 'Adobe Firefly & Generative Fill for Concept Art Production' },
      { sessionNumber: 5, title: 'AI Video Generation: Runway Gen-2/Gen-3, Luma Dream Machine & Sora' },
      { sessionNumber: 6, title: 'AI Voice Cloning & Sound Design: ElevenLabs, Suno AI & Udio' },
      { sessionNumber: 7, title: '3D AI Generation: Meshy AI, Tripo3D & Text-to-3D Pipelines' },
      { sessionNumber: 8, title: 'AI Copywriting & Scripting: ChatGPT, Claude & DeepSeek' },
      { sessionNumber: 9, title: 'AI-Powered Animation Pipeline: Video-to-Video & Motion Transfer' },
      { sessionNumber: 10, title: 'Complete AI-Generated Commercial / Short Film Production' },
    ]
  }
];

// Helper: Get list of all software names for dropdowns
export const getSoftwareList = (): string[] => {
  return SOFTWARE_DATABASE.map(sw => sw.name);
};

// Helper: Get software item by exact or partial name
export const findSoftwareDetails = (nameOrId?: string): SoftwareItem | undefined => {
  if (!nameOrId) return undefined;
  const clean = nameOrId.toLowerCase().trim();
  
  // Exact match
  const found = SOFTWARE_DATABASE.find(
    s => s.name.toLowerCase() === clean || s.id.toLowerCase() === clean
  );
  if (found) return found;

  // Partial match heuristics
  if (clean.includes('photoshop') || clean === 'ps') return SOFTWARE_DATABASE.find(s => s.id === 'ps');
  if (clean.includes('premiere') || clean === 'pr') return SOFTWARE_DATABASE.find(s => s.id === 'pr');
  if (clean.includes('after effects') || clean === 'afx') return SOFTWARE_DATABASE.find(s => s.id === 'afx');
  if (clean.includes('nuke')) return SOFTWARE_DATABASE.find(s => s.id === 'nuke');
  if (clean.includes('maya') && clean.includes('model')) return SOFTWARE_DATABASE.find(s => s.id === 'maya-mod');
  if (clean.includes('maya') && clean.includes('ani')) return SOFTWARE_DATABASE.find(s => s.id === 'maya-ani');
  if (clean.includes('maya') && clean.includes('rig')) return SOFTWARE_DATABASE.find(s => s.id === 'maya-rig');
  if (clean.includes('maya') && clean.includes('light')) return SOFTWARE_DATABASE.find(s => s.id === 'maya-lit');
  if (clean.includes('maya') && clean.includes('tex')) return SOFTWARE_DATABASE.find(s => s.id === 'maya-tex');
  if (clean.includes('maya') && clean.includes('ren')) return SOFTWARE_DATABASE.find(s => s.id === 'maya-ren');
  if (clean.includes('maya') && clean.includes('dyn')) return SOFTWARE_DATABASE.find(s => s.id === 'maya-dyn');
  if (clean.includes('maya') || clean.includes('animation')) return SOFTWARE_DATABASE.find(s => s.id === 'maya-mod');
  if (clean.includes('max') && clean.includes('model')) return SOFTWARE_DATABASE.find(s => s.id === 'max-mod');
  if (clean.includes('max') && clean.includes('tex')) return SOFTWARE_DATABASE.find(s => s.id === 'max-tex');
  if (clean.includes('max') && clean.includes('light')) return SOFTWARE_DATABASE.find(s => s.id === 'max-lit');
  if (clean.includes('max') && (clean.includes('rig') || clean.includes('ani'))) return SOFTWARE_DATABASE.find(s => s.id === 'max-rig-ani');
  if (clean.includes('max') || clean.includes('3ds')) return SOFTWARE_DATABASE.find(s => s.id === 'max-mod');
  if (clean.includes('mocha')) return SOFTWARE_DATABASE.find(s => s.id === 'mocha');
  if (clean.includes('silhouette')) return SOFTWARE_DATABASE.find(s => s.id === 'silhouette');
  if (clean.includes('vfx')) return SOFTWARE_DATABASE.find(s => s.id === 'nuke');
  if (clean.includes('substance') && clean.includes('painter')) return SOFTWARE_DATABASE.find(s => s.id === 'substance-painter');
  if (clean.includes('zbrush')) return SOFTWARE_DATABASE.find(s => s.id === 'zbrush');
  if (clean.includes('unreal')) return SOFTWARE_DATABASE.find(s => s.id === 'unreal');
  if (clean.includes('unity')) return SOFTWARE_DATABASE.find(s => s.id === 'unity');
  if (clean.includes('figma') || clean.includes('ui/ux') || clean.includes('ui&ux')) return SOFTWARE_DATABASE.find(s => s.id === 'figma');
  if (clean.includes('illustrator') || clean.includes('graphic design')) return SOFTWARE_DATABASE.find(s => s.id === 'ai-id');
  if (clean.includes('lightroom')) return SOFTWARE_DATABASE.find(s => s.id === 'lr');
  if (clean.includes('audition')) return SOFTWARE_DATABASE.find(s => s.id === 'audition');
  if (clean.includes('davinci')) return SOFTWARE_DATABASE.find(s => s.id === 'davinci');
  if (clean.includes('equalizer')) return SOFTWARE_DATABASE.find(s => s.id === '3dequalizer');
  if (clean.includes('houdini')) return SOFTWARE_DATABASE.find(s => s.id === 'houdini');
  if (clean.includes('gen ai') || clean.includes('ai')) return SOFTWARE_DATABASE.find(s => s.id === 'gen-ai');

  return undefined;
};

// Helper: Get session breakdown array for a software
export const getSoftwareSessionBreakdown = (softwareName?: string): SoftwareSession[] => {
  const item = findSoftwareDetails(softwareName);
  return item ? item.sessions : [];
};

// Helper: Get total number of sessions for a software
export const getSoftwareTotalSessions = (softwareName?: string): number => {
  const item = findSoftwareDetails(softwareName);
  return item ? item.totalSessions : 16;
};
